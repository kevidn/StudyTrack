import assert from "node:assert";
import { calculateUrgency, sortTasks } from "../utils/urgency.js";

console.log("=== Menjalankan Verifikasi Studi Kasus StudyTrack ===\n");

// Acuan: Tugas ID 2 (Project 3: BSTMap)
const taskID2 = {
  id: 2,
  judul: "Project 3: BSTMap Implementation",
  deadline: "2026-07-02T10:00:00",
  status: "belum",
  created_at: "2026-06-16T14:00:00"
};

// Skenario 1 (Positif): 2026-07-01 15:00 (sisa 19 jam)
{
  const currentTime = new Date("2026-07-01T15:00:00");
  const result = calculateUrgency(taskID2.deadline, taskID2.status, currentTime);
  console.log("Skenario 1 (Positif) - 19 Jam Menjelang Deadline:");
  console.log("  Output:", result);
  assert.strictEqual(result.urgency_status, "approaching");
  assert.strictEqual(result.rank, 1);
  assert.strictEqual(result.remaining_hours, 19);
  console.log("  [PASS] ID 2 terdeteksi sebagai 'approaching' dengan rank 1.\n");
}

// Skenario 2 (Negatif): 2026-07-02 12:00 (lewat 2 jam)
{
  const currentTime = new Date("2026-07-02T12:00:00");
  const result = calculateUrgency(taskID2.deadline, taskID2.status, currentTime);
  console.log("Skenario 2 (Negatif) - Lewat 2 Jam (Overdue):");
  console.log("  Output:", result);
  assert.strictEqual(result.urgency_status, "overdue");
  assert.strictEqual(result.rank, 2);
  assert.strictEqual(result.remaining_hours, -2);
  console.log("  [PASS] ID 2 terdeteksi sebagai 'overdue' dengan rank 2.\n");
}

// Skenario 3a (Edge Case): Sisa tepat 24 jam (2026-07-01 10:00)
{
  const currentTime = new Date("2026-07-01T10:00:00");
  const result = calculateUrgency(taskID2.deadline, taskID2.status, currentTime);
  console.log("Skenario 3a (Edge Case) - Sisa Tepat 24 Jam:");
  console.log("  Output:", result);
  assert.strictEqual(result.urgency_status, "normal");
  assert.strictEqual(result.rank, 3);
  assert.strictEqual(result.remaining_hours, 24);
  console.log("  [PASS] Tugas persis 24 jam tetap berkategori 'normal' (rank 3).\n");
}

// Skenario 3b (Edge Case): Sisa 19 jam tapi status sudah 'selesai'
{
  const currentTime = new Date("2026-07-01T15:00:00");
  const result = calculateUrgency(taskID2.deadline, "selesai", currentTime);
  console.log("Skenario 3b (Edge Case) - Deadline Dekat tapi Status Selesai:");
  console.log("  Output:", result);
  assert.strictEqual(result.urgency_status, "normal");
  assert.strictEqual(result.rank, 3);
  console.log("  [PASS] Tugas yang sudah selesai tidak menjadi approaching (rank 3).\n");
}

// Pengujian Sorting Sesuai Spesifikasi:
{
  console.log("Pengujian Sorting Seluruh Tugas Seed pada 2026-07-01 15:00:");
  const testNow = new Date("2026-07-01T15:00:00");
  const seedTasks = [
    { id: 1, judul: "Lab 4", deadline: "2026-07-03T23:59:00", status: "belum", created_at: "2026-06-15T09:00:00" },
    { id: 2, judul: "Project 3", deadline: "2026-07-02T10:00:00", status: "belum", created_at: "2026-06-16T14:00:00" },
    { id: 3, judul: "Sprint 2", deadline: "2026-07-06T23:59:00", status: "belum", created_at: "2026-06-17T11:00:00" }
  ];

  const processed = seedTasks.map(t => ({
    ...t,
    ...calculateUrgency(t.deadline, t.status, testNow)
  })).sort(sortTasks);

  console.log("  Urutan hasil sorting:", processed.map(t => `${t.id}: ${t.judul} (${t.urgency_status})`));
  assert.strictEqual(processed[0].id, 2, "Tugas ID 2 harus berada di urutan pertama (paling atas)");
  console.log("  [PASS] Tugas yang mendekati deadline berada di paling atas!\n");
}

console.log("=== SEMUA SKENARIO PENGUJIAN BERHASIL 100% ===");
