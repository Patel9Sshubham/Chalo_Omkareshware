import mongoose from "mongoose";

export async function connectDB(uri, fallbackUri) {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    return mongoose.connection;
  } catch (primaryError) {
    if (!fallbackUri) {
      throw primaryError;
    }

    console.warn("Primary MongoDB connection failed, trying fallback URI...");
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 8000 });
    return mongoose.connection;
  }
}
