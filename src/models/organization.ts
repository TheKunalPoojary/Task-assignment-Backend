import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type: String,
        trim: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        role:{
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },
        joinedAt:{
            type: Date,
            default: Date.now,
        }
    }]
},{timestamps:true});

export const Organization = mongoose.model('Organization', organizationSchema)