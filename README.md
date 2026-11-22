# StudyTrack — Reminder Tugas Mendekati Deadline
> **Academya Arkavidia 11.0 • Software Engineer Assessment**  
> Oleh: **Kevin Dzaky Hendratama**

Aplikasi manajemen tugas kuliah berbasis web yang telah ditingkatkan dengan fitur **Reminder Tugas Mendekati Deadline** menggunakan framework **3P (Perubahan &rarr; Pemetaan &rarr; Perincian)** dan implementasi nyata arsitektur 3 layer (Database, Backend, Frontend).

---

## 🚀 Fitur Baru: Reminder Tugas Mendekati Deadline (F01–F04)

1. **F01 (Deteksi Otomatis &lt; 24 Jam):** Tugas secara otomatis diklasifikasikan sebagai `approaching` (mendekati deadline) apabila sisa waktu hingga batas pengumpulan kurang dari 24 jam sejak waktu referensi saat ini.
2. **F02 (Prioritas Tampil Teratas & Aksen Oranye):** Tugas mendekati deadline ditempatkan di posisi paling atas halaman daftar tugas dengan aksen border oranye hangat (`#ea580c`), penanda badge `⏳ Segera (< 24 Jam)`, dan indikator sisa waktu.
3. **F03 (Penanda Khusus Overdue):** Tugas yang telah melewati batas deadline (`overdue`) tetap ditampilkan dengan pembeda visual yang jelas berupa border merah kontras (`#dc2626`) dan badge `⚠️ Terlewat (Overdue)`.
4. **F04 (Lintas Mata Kuliah):** Berlaku otomatis untuk seluruh tugas milik pengguna yang sedang login tanpa memandang mata kuliah asal.

---

## 🏛️ Arsitektur Teknis 3 Layer (Sesuai Slide Deck)

### Layer A: Database
- **Stabilitas Skema:** Skema tabel `tasks` dipertahankan **tanpa penambahan kolom baru**. Hal ini bertujuan menghindari *stale data* karena status urgensi bersifat dinamis dan bergantung pada pergerakan waktu.
- **Strategi Indexing:** Pada skenario production RDBMS (PostgreSQL/MySQL), diterapkan strategi composite index:
  ```sql
  CREATE INDEX idx_tasks_user_status_deadline ON tasks (user_id, status, deadline);
  ```
  untuk memastikan query pencarian tugas per pengguna dan pengurutan deadline berjalan dengan efisiensi $O(\log N)$.

### Layer B: Backend Logic (`backend/utils/urgency.js` & `backend/routes/tasks.js`)
- Logika penentuan status urgensi dieksekusi terpusat di server untuk memastikan konsistensi waktu (*single source of truth*).
- **Logika Klasifikasi & Ranking:**
  ```text
  diffHours = (deadline - now) / 1 jam
  IF status == 'selesai':
      rank = 3 (urgency_status = 'normal')
  ELSE IF diffHours < 0:
      rank = 2 (urgency_status = 'overdue')
  ELSE IF diffHours < 24:
      rank = 1 (urgency_status = 'approaching')
  ELSE:
      rank = 3 (urgency_status = 'normal')
  ```
- **Sorting Logic:** `SORT BY rank ASC, deadline ASC, created_at DESC`.

### Layer C: Frontend UI (`frontend/src/components/TaskCard.jsx`)
- Render kondisional dengan feedback visual kontras:
  - **Approaching:** Aksen border oranye, background lembut, badge `⏳ Segera (< 24 Jam)`.
  - **Overdue:** Aksen border merah, badge `⚠️ Terlewat (Overdue)`.
  - **Normal:** Tampilan netral abu-abu tanpa distraksi.
- **🔬 Simulator Skenario (Demo Helper):** Dilengkapi bar simulasi waktu interaktif di halaman utama untuk memudahkan pengujian live dan presentasi video.

---

## 🧪 Hasil Verifikasi & Pengujian Otomatis

Seluruh skenario pengujian dari **Tugas 3 Dokumen Studi Kasus** telah diverifikasi dengan automated test suite:

```bash
npm test
```

| No | Skenario | Kondisi / Input | Hasil yang Diharapkan | Status |
|:---|:---|:---|:---|:---:|
| 1 | **Positif** | Waktu acuan: `2026-07-01 15:00` (sisa 19 jam dari ID 2) | ID 2 berkategori `approaching`, rank 1, tampil paling atas | **PASS** |
| 2 | **Negatif** | Waktu acuan: `2026-07-02 12:00` (lewat 2 jam dari ID 2) | ID 2 berkategori `overdue`, rank 2, aksen merah | **PASS** |
| 3a | **Edge Case** | Sisa tepat 24 jam (`2026-07-01 10:00`) | Berkategori `normal` (rank 3), tidak naik ke prioritas | **PASS** |
| 3b | **Edge Case** | Sisa 19 jam tetapi status sudah `selesai` | Berkategori `normal` (rank 3), tidak dianggap urgent | **PASS** |

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js &ge; 20.19.0
- npm

### 1. Jalankan Seluruh Aplikasi (Fullstack)
```bash
# Install seluruh dependency
npm run postinstall

# Build frontend untuk mode produksi
npm run build

# Jalankan server
npm start
```
Buka browser di `http://localhost:4000`.

### 2. Mode Pengembangan (Hot Reload)
- **Terminal 1 (Backend):**
  ```bash
  cd backend
  cp .env.example .env
  npm run dev
  ```
  Backend aktif di `http://localhost:4000`.

- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
  Frontend aktif di `http://localhost:5173`.

### 3. Akun Demo
- **Email:** `demo@studytrack.test`
- **Password:** `demo1234`

---

## 🌐 Panduan Deployment Publik (Bonus)

Aplikasi telah disiapkan agar siap di-deploy secara instan ke platform cloud gratis:

### Opsi A: Render.com (Direkomendasikan via `render.yaml`)
1. Buka [dashboard.render.com](https://dashboard.render.com/) & pilih **New +** &rarr; **Blueprint** (atau **Web Service**).
2. Hubungkan repositori GitHub: `https://github.com/kevidn/StudyTrack`.
3. Render akan membaca `render.yaml` secara otomatis dan melakukan build serta deploy.

### Opsi B: Docker Container
Tersedia multi-stage `Dockerfile`:
```bash
docker build -t studytrack .
docker run -p 4000:4000 studytrack
```

---

## 🌿 Git Branching Strategy
Pengerjaan proyek mengikuti prinsip Git Workflow yang rapi dan deskriptif:
- `main`: Branch rilis stabil.
- `feat/deadline-reminder`: Branch pengerjaan fitur dengan Conventional Commits.
- Pull Request terstruktur dapat ditinjau di: [PR #1 di GitHub](https://github.com/kevidn/StudyTrack/pull/1).
