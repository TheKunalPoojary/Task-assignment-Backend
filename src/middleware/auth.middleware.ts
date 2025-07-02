import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.header("Authorization");
        if(!authHeader){
            res.status(401).json("Authentication required")
        }
        const token = authHeader?.replace('Bearer','');
        if(!token || !token.trim()){
            return res.status(401).json("Authentication token is missing");
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json("JWT secret is not configured");
        }
        const decode = jwt.verify(token.trim(), jwtSecret);
        req.user = decode;
        next();
    }catch(error){
        res.status(401).json("Invalid or expired token ")
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const user = await User.findById(req.user._id)
        if(user?.role !== "admin" && user?.role !== "super"){
            return res.status(403).send({error:"Access denied"})
        }
        next();
    }catch(error){
        res.json(error)
    }
}

export const orgnizationAdmin = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const user = await User.findById(req.user._id).populate('organization');
    if (!user?.organization) {
      return res.status(403).json({error:"User not associated with any organization"});
    }

    // Check if user is admin in their organization
    if (user.role !== 'admin') {
      return res.status(403).json({error:"Access denied: Requires organization admin privileges"});
    }

    // Add organization to request object for controllers to use
    req.organization = user.organization;
    next();
    }catch{
        res.status(500)
    }
}
