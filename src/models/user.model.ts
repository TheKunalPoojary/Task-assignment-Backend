import mongoose from "mongoose"
import { Task } from "./task.model.js";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    role: { type: String, enum: ["user", "admin", "super"], default: "user" },
  });
  
  export const User = mongoose.model("User", userSchema);