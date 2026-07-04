import mongoose from "mongoose";

const buildMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const cluster = process.env.MONGODB_CLUSTER;
  const db = process.env.MONGODB_DB || "campus-placement-portal";

  if (!user || !password || !cluster) {
    throw new Error(
      "MongoDB config missing. Set MONGODB_URI or MONGODB_USER, MONGODB_PASSWORD, and MONGODB_CLUSTER in server/.env"
    );
  }

  const encodedPassword = encodeURIComponent(password);
  return `mongodb+srv://${user}:${encodedPassword}@${cluster}/${db}?retryWrites=true&w=majority&appName=Cluster0`;
};

const connectDB = async () => {
  try {
    const uri = buildMongoUri();
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
