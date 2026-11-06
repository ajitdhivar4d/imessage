import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "fs";
import path from "path";

import { clerkMiddleware } from "@clerk/express";

import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

// remove this because make in socket.js file
// const app = express();

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

// it's important that you don't pars the webhook event data, it should be in raw format
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files from the public directory
// this is for the production build, not for the development
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// remove the below line in production
/*app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);

  // start the cron job only in production mode
  if (process.env.NODE_ENV === "production") job.start();
});
 */
server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);

  // start the cron job only in production mode
  if (process.env.NODE_ENV === "production") job.start();
});
