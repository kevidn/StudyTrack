import React from "react";

/**
 * Memformat deadline ke tampilan lokal Indonesia, contoh: "03 Jul 2026, 23.59".
 *
 * @param {string} deadline Tanggal dan jam deadline dari API.
 * @returns {string}
 */
function formatDeadline(deadline) {
  const d = new Date(deadline);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Card satu tugas pada halaman Daftar Tugas.
 * Menampilkan penanda visual berdasarkan `urgency_status`:
 * - "approaching" : Aksen oranye kontras, badge "Segera (< 24 Jam)", info sisa waktu
 * - "overdue"     : Aksen merah kontras, badge "Terlewat / Overdue", info waktu lewat
 * - "normal"      : Tampilan default
 */
export default function TaskCard({ task, onToggleStatus, onDelete }) {
  const urgencyStatus = task.urgency_status || "normal";

  // Label dan badge penanda urgensi
  let urgencyBadge = null;
  let remainingText = null;

  if (urgencyStatus === "approaching") {
    urgencyBadge = (
      <span className="badge badge-urgency approaching">
        ⏳ Segera (&lt; 24 Jam)
      </span>
    );
    if (typeof task.remaining_hours === "number") {
      remainingText = `Sisa waktu: ~${task.remaining_hours} jam`;
    }
  } else if (urgencyStatus === "overdue") {
    urgencyBadge = (
      <span className="badge badge-urgency overdue">
        ⚠️ Terlewat (Overdue)
      </span>
    );
    if (typeof task.remaining_hours === "number") {
      remainingText = `Terlewat: ~${Math.abs(task.remaining_hours)} jam lalu`;
    }
  }

  return (
    <div className={`card task-card urgency-${urgencyStatus}`}>
      <div className="task-info">
        <div className="task-header-line">
          <strong className="task-title">{task.judul}</strong>
          {urgencyBadge}
        </div>
        <div className="meta course-meta">{task.mata_kuliah}</div>
        <div className="meta deadline-meta">
          <strong>Deadline:</strong> {formatDeadline(task.deadline)}
          {remainingText && <span className="remaining-tag"> ({remainingText})</span>}
        </div>
        {task.deskripsi && <div className="meta desc-meta">{task.deskripsi}</div>}
      </div>

      <div className="task-actions" style={{ textAlign: "right" }}>
        <span className={`badge ${task.status}`}>
          {task.status === "selesai" ? "Selesai" : "Belum"}
        </span>
        <div className="task-btn-group" style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => onToggleStatus(task)}>
            {task.status === "selesai" ? "Tandai Belum" : "Tandai Selesai"}
          </button>
          <button className="btn btn-delete" onClick={() => onDelete(task.id)}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
