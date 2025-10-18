



import mongoose from "mongoose";

const connectdb = async () => {
  try {
    // Access environment variable
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB is connected");
  } catch (err) {
    console.log(err);
    console.log("Failed to connect with DB");
  }
};

export default connectdb;
