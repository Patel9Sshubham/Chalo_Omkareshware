import mongoose from "mongoose";

function buildMongoUriFromParts() {
  const host = process.env.MONGO_HOST || process.env.MONGODB_HOST;
  if (!host) {
    return "";
  }

  const username = process.env.MONGO_USER || process.env.MONGO_USERNAME || "";
  const password = process.env.MONGO_PASSWORD || process.env.MONGO_PASS || "";
  const dbName = process.env.MONGO_DB_NAME || process.env.MONGO_DB || "chalo_omkareshwar";
  const protocol = process.env.MONGO_PROTOCOL || "mongodb+srv";
  const options = process.env.MONGO_OPTIONS || "retryWrites=true&w=majority";

  if (!username || !password) {
    throw new Error(
      "MongoDB host was provided, but MONGO_USER and MONGO_PASSWORD are missing. Add them to backend/.env or use MONGO_URI."
    );
  }

  return `${protocol}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${dbName}?${options}`;
}

export function resolveMongoUri() {
  const directUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DB_URI ||
    "";

  if (directUri) {
    return directUri.trim().replace(/^["']|["']$/g, "");
  }

  const builtUri = buildMongoUriFromParts();
  if (builtUri) {
    return builtUri;
  }

  return "mongodb://127.0.0.1:27017/chalo_omkareshwar";
}

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    return mongoose.connection;
  } catch (error) {
    const message = String(error?.message || "");
    const likelyUriIssue =
      uri.includes("@") &&
      !uri.includes("%40") &&
      /auth|parse|format|hostname|host|server selection|ECONNREFUSED/i.test(message);

    if (likelyUriIssue) {
      throw new Error(
        "MongoDB URI looks malformed. If your password contains special characters like @, :, / or #, encode it or use MONGO_HOST + MONGO_USER + MONGO_PASSWORD in backend/.env."
      );
    }

    throw error;
  }
}
