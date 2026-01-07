import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// ✅ CORS (important) — allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  ORIGIN, // if you set CLIENT_ORIGIN in Render
  // ✅ add your vercel domain here (example)
  "https://realagro-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (Postman, curl)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ handle preflight properly (important)
app.options("*", cors());

// Use MONGODB_URI (and also support MONGO_URI if you ever switch)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGODB_URI in backend/.env");
  process.exit(1);
}

// ✅ CORS (important)
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ handle preflight properly (important)
app.options("*", cors({ origin: ORIGIN, credentials: true }));

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.send("🚀 RealAgro Backend connected!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: err?.message || "Server error" });
});

async function start() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

start();

export default app;
