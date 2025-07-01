import mongoose from "mongoose";

export const connectdb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};
