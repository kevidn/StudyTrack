/**
 * Modul Utilitas Urgensi Deadline
 * Sesuai Rancangan Teknis Layer B (Backend) - Studi Kasus StudyTrack
 *
 * Logika Klasifikasi:
 * - Jika status == "selesai": rank = 3, urgency_status = "normal"
 * - Jika diff < 0 jam      : rank = 2, urgency_status = "overdue"
 * - Jika diff < 24 jam     : rank = 1, urgency_status = "approaching"
 * - Else                   : rank = 3, urgency_status = "normal"
 */

/**
 * Menghitung sisa waktu, status urgensi, dan ranking sorting tugas.
 *
 * @param {string} deadline - Waktu batas tugas (format lokal / ISO)
 * @param {string} status - Status pengerjaan ("belum" | "selesai")
 * @param {Date|string|number} [currentTime] - Waktu referensi (default: waktu sekarang)
 * @returns {{ urgency_status: 'approaching'|'overdue'|'normal', remaining_hours: number, rank: number }}
 */
export function calculateUrgency(deadline, status, currentTime = new Date()) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  const deadlineDate = new Date(deadline);

  // Selisih waktu dalam milidetik dan jam
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Jika tugas sudah selesai, status urgensi selalu "normal" (tidak perlu diperingatkan lagi)
  if (status === "selesai") {
    return {
      urgency_status: "normal",
      remaining_hours: Number(diffHours.toFixed(1)),
      rank: 3
    };
  }

  // Jika waktu deadline sudah lewat (diff < 0)
  if (diffHours < 0) {
    return {
      urgency_status: "overdue",
      remaining_hours: Number(diffHours.toFixed(1)),
      rank: 2
    };
  }

  // Jika sisa waktu kurang dari 24 jam sejak sekarang
  if (diffHours < 24) {
    return {
      urgency_status: "approaching",
      remaining_hours: Number(diffHours.toFixed(1)),
      rank: 1
    };
  }

  // Sisa waktu >= 24 jam
  return {
    urgency_status: "normal",
    remaining_hours: Number(diffHours.toFixed(1)),
    rank: 3
  };
}

/**
 * Fungsi sorting tugas sesuai spesifikasi Tugas 2:
 * 1. Urutkan berdasarkan rank ASC (1: approaching -> 2: overdue -> 3: normal)
 * 2. Tie-breaker 1: deadline ASC (deadline lebih dekat di atas)
 * 3. Tie-breaker 2: created_at DESC (tugas lebih baru di atas)
 */
export function sortTasks(taskA, taskB) {
  if (taskA.rank !== taskB.rank) {
    return taskA.rank - taskB.rank;
  }
  const deadlineDiff = new Date(taskA.deadline).getTime() - new Date(taskB.deadline).getTime();
  if (deadlineDiff !== 0) {
    return deadlineDiff;
  }
  return new Date(taskB.created_at).getTime() - new Date(taskA.created_at).getTime();
}
