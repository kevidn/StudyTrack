/**
 * Entry point backend StudyTrack.
 *
 * Menyiapkan Express, mendaftarkan route tiap modul (auth, courses, tasks),
 * lalu menjalankan server.
 */
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { PORT } from "./config.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import taskRoutes from "./routes/tasks.js";
import { resetDB } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../frontend/dist");

const app = express();

app.use(cors());
app.use(express.json());

// GET /api/health - cek apakah server sedang berjalan
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StudyTrack backend is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tasks", taskRoutes);

/*
 * POST /api/dev/reset - mengembalikan data ke kondisi seed awal.
 *
 * Endpoint ini tidak memerlukan login, jadi hanya didaftarkan di luar mode
 * production supaya data tidak bisa direset oleh siapa pun setelah di-deploy.
 */
if (process.env.NODE_ENV !== "production") {
  app.post("/api/dev/reset", (req, res) => {
    resetDB();
    res.json({ success: true, message: "Database direset ke data seed awal." });
  });
}

// Sajikan file statis frontend jika build tersedia (produksi / fullstack deployment)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Fallback untuk endpoint API yang tidak terdaftar
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

app.listen(PORT, () => {
  console.log(`StudyTrack backend berjalan di http://localhost:${PORT}`);
});
