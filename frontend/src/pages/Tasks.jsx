import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";

/**
 * Halaman Daftar Tugas:
 * - Menampilkan form tambah tugas
 * - Pengalih skenario waktu verifikasi (Demo Mode Tugas 3)
 * - Daftar seluruh tugas pengguna lintas mata kuliah yang terurut berdasarkan
 *   prioritas urgensi deadline (approaching -> overdue -> normal)
 */
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [activeScenario, setActiveScenario] = useState("realtime");

  // Definisi skenario waktu pengujian sesuai Tugas 3 Dokumen Studi Kasus
  const SCENARIOS = {
    realtime: {
      label: "Waktu Nyata (Server)",
      timeValue: null,
      desc: "Waktu berjalan saat ini."
    },
    scenario1: {
      label: "Skenario 1 (Positif: 2026-07-01 15:00)",
      timeValue: "2026-07-01T15:00:00",
      desc: "Sisa 19 jam menjelang deadline ID 2 -> ID 2 berstatus mendekati deadline & tampil di urutan teratas."
    },
    scenario2: {
      label: "Skenario 2 (Negatif: 2026-07-02 12:00)",
      timeValue: "2026-07-02T12:00:00",
      desc: "Lewat 2 jam dari deadline ID 2 -> ID 2 berstatus overdue dengan aksen merah."
    },
    scenario3: {
      label: "Skenario 3 (Edge Case: 2026-07-01 10:00)",
      timeValue: "2026-07-01T10:00:00",
      desc: "Sisa tepat 24 jam -> ID 2 tetap berkategori normal dan tidak dinaikkan ke prioritas teratas."
    }
  };

  async function loadData(scenarioKey = activeScenario) {
    try {
      const scenario = SCENARIOS[scenarioKey];
      const tasksUrl = scenario && scenario.timeValue ? `/tasks?now=${scenario.timeValue}` : "/tasks";
      const [tasksRes, coursesRes] = await Promise.all([api.get(tasksUrl), api.get("/courses")]);
      setTasks(tasksRes.data.tasks);
      setCourses(coursesRes.data.courses);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  }

  useEffect(() => {
    loadData(activeScenario);
  }, [activeScenario]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!courseId) {
      setError("Pilih mata kuliah terlebih dahulu.");
      return;
    }
    try {
      await api.post("/tasks", { mata_kuliah_id: courseId, judul, deskripsi, deadline });
      setJudul("");
      setDeskripsi("");
      setDeadline("");
      loadData(activeScenario);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambahkan tugas.");
    }
  }

  async function handleToggleStatus(task) {
    const newStatus = task.status === "selesai" ? "belum" : "selesai";
    await api.put(`/tasks/${task.id}`, { status: newStatus });
    loadData(activeScenario);
  }

  async function handleDelete(id) {
    await api.delete(`/tasks/${id}`);
    loadData(activeScenario);
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Daftar Tugas</h1>

        {/* Panel Simulator Skenario Verifikasi (Tugas 3 Arkavidia) */}
        <div className="scenario-bar">
          <div className="scenario-bar-title">
            <span>🔬 Simulator Skenario Waktu (Verifikasi Tugas 3)</span>
            <small style={{ fontWeight: "normal", textTransform: "none", color: "#64748b" }}>
              Uji penandaan visual sesuai rancangan
            </small>
          </div>
          <div className="scenario-chips">
            {Object.entries(SCENARIOS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`chip-btn ${activeScenario === key ? "active" : ""}`}
                onClick={() => setActiveScenario(key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.82rem", color: "#475569" }}>
            <em>{SCENARIOS[activeScenario].desc}</em>
          </div>
        </div>

        <div className="card">
          <h2>Tambah Tugas</h2>
          <form onSubmit={handleSubmit}>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Judul Tugas"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
            />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Tambah Tugas</button>
          </form>
        </div>

        {tasks.length === 0 && <p>Belum ada tugas. Tambahkan tugas pertama Anda di atas.</p>}

        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}
