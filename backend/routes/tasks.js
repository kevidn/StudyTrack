import { Router } from "express";
import { readDB, writeDB } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateUrgency, sortTasks } from "../utils/urgency.js";

const router = Router();

// Seluruh endpoint tugas membutuhkan login.
router.use(requireAuth);

/**
 * GET /api/tasks
 * Daftar seluruh tugas milik pengguna yang sedang login, lintas semua mata
 * kuliah. Setiap tugas menyertakan `mata_kuliah` (nama mata kuliahnya) serta
 * `urgency_status`, `remaining_hours`, dan `rank` hasil kalkulasi waktu server.
 *
 * Urutan pengurutan (sesuai spesifikasi Tugas 2 Layer B):
 * 1. rank ASC (1: approaching -> 2: overdue -> 3: normal)
 * 2. deadline ASC (deadline terdekat tampil lebih atas)
 * 3. created_at DESC (tugas terbaru di atas jika deadline sama)
 *
 * Response : 200 { tasks }
 */
router.get("/", (req, res) => {
  const db = readDB();
  // Waktu referensi terpusat di server (dapat dioverride via ?now= untuk testing skenario verifikasi)
  const referenceTime = req.query.now ? new Date(req.query.now) : new Date();

  const tasks = db.tasks
    .filter((t) => t.user_id === req.user.id)
    .map((t) => {
      const course = db.courses.find((c) => c.id === t.mata_kuliah_id);
      const urgency = calculateUrgency(t.deadline, t.status, referenceTime);
      return {
        ...t,
        mata_kuliah: course ? course.name : null,
        ...urgency
      };
    })
    .sort(sortTasks);

  res.json({ tasks });
});

/**
 * GET /api/tasks/:id
 * Detail satu tugas milik pengguna yang sedang login.
 *
 * Response : 200 { task } | 404 tidak ditemukan
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const task = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!task) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  const course = db.courses.find((c) => c.id === task.mata_kuliah_id);
  const urgency = calculateUrgency(task.deadline, task.status);

  res.json({
    task: {
      ...task,
      mata_kuliah: course ? course.name : null,
      ...urgency
    }
  });
});

/**
 * POST /api/tasks
 * Menambahkan tugas baru dengan status awal "belum".
 *
 * Body     : { mata_kuliah_id, judul, deadline, deskripsi? }
 * Response : 201 { task } | 400 input tidak valid atau mata kuliah bukan milik user
 */
router.post("/", (req, res) => {
  const { mata_kuliah_id, judul, deskripsi, deadline } = req.body;
  if (!mata_kuliah_id || !judul || !deadline) {
    return res.status(400).json({ error: "mata_kuliah_id, judul, dan deadline wajib diisi." });
  }

  const db = readDB();
  const course = db.courses.find((c) => c.id === Number(mata_kuliah_id) && c.user_id === req.user.id);
  if (!course) {
    return res.status(400).json({ error: "Mata kuliah tidak ditemukan untuk user ini." });
  }

  const newTask = {
    id: db.nextIds.task++,
    user_id: req.user.id,
    mata_kuliah_id: Number(mata_kuliah_id),
    judul,
    deskripsi: deskripsi || "",
    deadline,
    status: "belum",
    created_at: new Date().toISOString()
  };
  db.tasks.push(newTask);
  writeDB(db);
  res.status(201).json({ task: newTask });
});

/**
 * PUT /api/tasks/:id
 * Memperbarui tugas, termasuk mengubah status. Hanya field yang dikirim yang
 * diubah.
 *
 * Body     : { judul?, deskripsi?, deadline?, status? } (status: "belum" | "selesai")
 * Response : 200 { task } | 400 status tidak valid | 404 tidak ditemukan
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const task = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!task) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  const { judul, deskripsi, deadline, status } = req.body;
  if (judul !== undefined) task.judul = judul;
  if (deskripsi !== undefined) task.deskripsi = deskripsi;
  if (deadline !== undefined) task.deadline = deadline;
  if (status !== undefined) {
    if (!["belum", "selesai"].includes(status)) {
      return res.status(400).json({ error: "Status hanya boleh 'belum' atau 'selesai'." });
    }
    task.status = status;
  }
  writeDB(db);
  res.json({ task });
});

/**
 * DELETE /api/tasks/:id
 * Menghapus satu tugas.
 *
 * Response : 200 { success: true } | 404 tidak ditemukan
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  const task = db.tasks.find((t) => t.id === id && t.user_id === req.user.id);
  if (!task) {
    return res.status(404).json({ error: "Tugas tidak ditemukan." });
  }

  db.tasks = db.tasks.filter((t) => t.id !== id);
  writeDB(db);
  res.json({ success: true });
});

export default router;
