import express from "express";
import { LocalDatabase } from "./db";
import { INITIAL_MOCK_DATA } from "../src/data/mockData";
import { createQASpreadsheet } from "./googleSheets";

export const app = express();

// Middleware for parsing JSON requests (up to 50mb to support base64 screenshots)
app.use(express.json({ limit: "50mb" }));

// --- API ENDPOINTS ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Users Auth & Management
app.get("/api/users", (req, res) => {
  try {
    const users = LocalDatabase.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", (req, res) => {
  try {
    const { id, name, role, password, division, position, email, joinDate, status, passwordResetRequest } = req.body;
    const userEmail = email ? email.toLowerCase().trim() : '';
    if (!userEmail || !name || !role || !password) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const users = LocalDatabase.getUsers();
    const exists = users.some(u => u.email && u.email.toLowerCase() === userEmail);
    if (exists) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    const dummyUsername = userEmail.split('@')[0];

    const newUser = {
      id: id || `usr-${Date.now()}`,
      username: dummyUsername,
      name,
      role,
      password,
      division: division || 'IT SOLUTION',
      position: position || '',
      email: userEmail,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
      passwordResetRequest: passwordResetRequest || 'none'
    };

    LocalDatabase.addUser(newUser);
    res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit / Update User Profile or Status
app.put("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const users = LocalDatabase.getUsers();
    const existingUser = users.find(u => u.id === id);
    if (existingUser) {
      if (existingUser.role === 'superadmin') {
        return res.status(400).json({ error: "Akun Super Admin tidak dapat diedit atau dimodifikasi." });
      }
    }

    LocalDatabase.updateUser(id, updates);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User
app.delete("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const users = LocalDatabase.getUsers();
    const existingUser = users.find(u => u.id === id);
    if (existingUser && existingUser.role === 'superadmin') {
      return res.status(400).json({ error: "Akun Super Admin tidak dapat dihapus." });
    }
    LocalDatabase.deleteUser(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request Reset Password
app.post("/api/users/request-reset", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email wajib diisi" });
    }

    const users = LocalDatabase.getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Email tidak ditemukan" });
    }

    LocalDatabase.updateUser(user.id, { passwordResetRequest: 'pending_approval' });
    res.json({ success: true, message: "Permintaan reset password berhasil diajukan ke Administrator." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Reset Password Request
app.post("/api/users/approve-reset", (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID wajib diisi" });
    }

    LocalDatabase.updateUser(userId, { passwordResetRequest: 'approved' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Execution
app.post("/api/users/reset-password", (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email dan password baru wajib diisi" });
    }

    const users = LocalDatabase.getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Email tidak ditemukan" });
    }

    if (user.passwordResetRequest !== 'approved') {
      return res.status(403).json({ error: "Permintaan reset password belum disetujui oleh Administrator." });
    }

    LocalDatabase.updateUser(user.id, { 
      password: newPassword,
      passwordResetRequest: 'none' 
    });
    res.json({ success: true, message: "Password berhasil diperbarui! Silakan login." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Learning Entries
app.get("/api/entries", (req, res) => {
  try {
    const entries = LocalDatabase.getEntries();
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/entries", (req, res) => {
  try {
    const entry = req.body;
    const entries = LocalDatabase.getEntries();

    const existsIdx = entries.findIndex(e => e.id === entry.id);
    if (existsIdx > -1) {
      entries[existsIdx] = entry;
    } else {
      entries.unshift(entry);
    }

    LocalDatabase.saveEntries(entries);
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/entries/:id", (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = String(req.headers["x-user-id"] || "").trim();
    const users = LocalDatabase.getUsers();
    const requester = requesterId ? users.find(u => u.id === requesterId) : undefined;

    if (!requester) {
      return res.status(403).json({ error: "Autentikasi diperlukan untuk menghapus laporan." });
    }

    const entries = LocalDatabase.getEntries();
    const targetEntry = entries.find(e => e.id === id);
    if (!targetEntry) {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }

    const isPrivileged = requester.role === "admin" || requester.role === "superadmin";
    const isOwner =
      (targetEntry.userId && targetEntry.userId === requester.id) ||
      (targetEntry.nama && requester.name && targetEntry.nama.trim().toLowerCase() === requester.name.trim().toLowerCase());

    if (!isPrivileged && !isOwner) {
      return res.status(403).json({ error: "Karyawan hanya dapat menghapus laporan milik akunya sendiri." });
    }

    const filtered = entries.filter(e => e.id !== id);
    LocalDatabase.saveEntries(filtered);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET AI Trend Summarize/Analysis
app.get("/api/entries/trends", async (req, res) => {
  try {
    const entries = LocalDatabase.getEntries();
    
    const groupedByMonth: { [key: string]: any[] } = {};
    entries.forEach(entry => {
      if (entry.tanggalIsi) {
        const parts = entry.tanggalIsi.split('-');
        if (parts.length >= 2) {
          const monthKey = `${parts[0]}-${parts[1]}`;
          if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
          }
          groupedByMonth[monthKey].push(entry);
        }
      }
    });

    const monthNames: { [key: string]: string } = {
      "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
      "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
      "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
    };

    const sortedMonthKeys = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

    const trendsFallback = sortedMonthKeys.map(monthKey => {
      const monthEntries = groupedByMonth[monthKey];
      const [year, month] = monthKey.split('-');
      const monthName = `${monthNames[month] || month} ${year}`;
      
      const hoursSaved = monthEntries.reduce((sum, e) => sum + (e.estimasiWaktuDihemat || 0), 0);
      
      const toolsCount: { [key: string]: number } = {};
      monthEntries.forEach(e => {
        if (e.aiYangDipakai) {
          toolsCount[e.aiYangDipakai] = (toolsCount[e.aiYangDipakai] || 0) + 1;
        }
      });
      let topTool = "Gemini";
      let maxCount = 0;
      Object.entries(toolsCount).forEach(([tool, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topTool = tool;
        }
      });

      let trendingTopic = "AI Integration & Learning";
      let category = "Umum";
      let summary = "Karyawan berfokus pada eksplorasi efisiensi kerja menggunakan AI.";
      let highlights: string[] = [];

      const allText = monthEntries.map(e => `${e.namaFiturTopik} ${e.deskripsiSingkat} ${e.poinPenting}`).join(' ').toLowerCase();
      
      if (allText.includes("claude") && (allText.includes("fable") || allText.includes("artifact") || allText.includes("3.5") || allText.includes("sonnet"))) {
        trendingTopic = "Claude 3.5 Sonnet & Artifacts";
        category = "UI/UX & Rapid Prototyping";
        summary = `Bulan ini didominasi oleh pemanfaatan fitur interaktif Claude, khususnya Artifacts dan model Claude 3.5 Sonnet untuk mempercepat desain UI serta pembuatan kode fungsional.`;
        highlights = [
          "Pemanfaatan Claude Artifacts untuk mereview mock-up desain secara real-time.",
          "Peningkatan efisiensi pembuatan kode frontend fungsional.",
          "Eksplorasi pembuatan aplikasi mandiri (mini-apps) secara mandiri."
        ];
      } else if (allText.includes("agent") || allText.includes("crewai") || allText.includes("autonomous") || allText.includes("agen")) {
        trendingTopic = "Autonomous AI Agents";
        category = "Process Automation & Engineering";
        summary = `Tren bulan ini beralih ke agen AI mandiri yang mampu menyelesaikan tugas multi-step secara otomatis untuk efisiensi workflow divisi.`;
        highlights = [
          "Pembuatan skrip otomatisasi berbasis agen AI untuk integrasi data.",
          "Eksplorasi framework CrewAI dan LangChain untuk orkestrasi tugas.",
          "Pengurangan beban tugas administratif manual hingga 40%."
        ];
      } else if (allText.includes("v0") || allText.includes("vercel") || allText.includes("ui") || allText.includes("desain") || allText.includes("tailwind")) {
        trendingTopic = "v0.dev UI Design Generation";
        category = "UI/UX & Prototyping";
        summary = `Divisi sangat aktif menggunakan v0 by Vercel untuk mendesain komponen antarmuka web modern dengan Tailwind CSS dan React secara instan.`;
        highlights = [
          "Generasi layout dasbor dan form responsif menggunakan prompt deskriptif.",
          "Ekspor langsung komponen React ke basis kode proyek aktif.",
          "Kolaborasi yang lebih cepat antara Product Owner dan Designer."
        ];
      } else if (allText.includes("gemini") && (allText.includes("refactor") || allText.includes("test") || allText.includes("code") || allText.includes("unit"))) {
        trendingTopic = "Gemini Code Refactoring & Testing";
        category = "Developer Efficiency";
        summary = `Fokus utama bulan ini adalah optimalisasi kode legacy dan pembuatan cakupan unit test otomatis menggunakan kemampuan penalaran Gemini.`;
        highlights = [
          "Refactoring fungsi-fungsi kompleks menjadi modul yang mudah dites.",
          "Generasi edge cases unit testing secara instan menggunakan Gemini 2.5/3.5.",
          "Pengurangan bug pra-produksi berkat cakupan testing yang lebih baik."
        ];
      } else if (allText.includes("prd") || allText.includes("product") || allText.includes("user story") || allText.includes("requirement")) {
        trendingTopic = "AI Product Requirements (PRD)";
        category = "Product Management";
        summary = `Eksplorasi AI diarahkan pada akselerasi penyusunan dokumentasi produk dan user stories yang detail menggunakan LLM.`;
        highlights = [
          "Penyusunan backlog dan kriteria penerimaan (acceptance criteria) berstandar BDD.",
          "Brainstorming skenario edge-case sejak fase inisiasi fitur.",
          "Drafting PRD lengkap dalam hitungan menit dari ide dasar."
        ];
      } else if (allText.includes("sql") || allText.includes("database") || allText.includes("query") || allText.includes("postgresql")) {
        trendingTopic = "SQL Query & DB Optimization";
        category = "Backend Performance";
        summary = `Karyawan mengeksplorasi penggunaan AI untuk menganalisis query bottleneck, membuat index yang efisien, dan menyusun query kompleks secara aman.`;
        highlights = [
          "Analisis database explain plan dengan bantuan AI untuk mendeteksi slow queries.",
          "Generasi kueri SQL relasional yang kompleks tanpa risiko sintaksis.",
          "Optimalisasi skema database internal divisi."
        ];
      } else {
        trendingTopic = `Penerapan Eksperimental ${topTool}`;
        category = "Productivity Enhancement";
        summary = `Pemanfaatan asisten AI ${topTool} untuk mengoptimalkan tugas operasional sehari-hari dan memperdalam pemahaman teknologi AI terbaru.`;
        highlights = [
          `Eksplorasi fitur-fitur lanjutan ${topTool} untuk menunjang produktivitas kerja.`,
          "Peningkatan pemahaman teknik prompt engineering yang efisien.",
          "Penyebarluasan hasil pembelajaran ke anggota tim lainnya."
        ];
      }

      return {
        monthKey,
        monthName,
        trendingTopic,
        category,
        summary,
        topTool,
        highlights,
        hoursSaved
      };
    });

    res.json(trendsFallback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/entries/import", (req, res) => {
  try {
    const newEntries = req.body;
    if (!Array.isArray(newEntries)) {
      return res.status(400).json({ error: "Payload must be an array of entries" });
    }

    const currentEntries = LocalDatabase.getEntries();
    const combined = [...newEntries, ...currentEntries];
    LocalDatabase.saveEntries(combined);
    res.json({ success: true, count: newEntries.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Articles
app.get("/api/articles", (req, res) => {
  try {
    const articles = LocalDatabase.getArticles();
    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/articles", (req, res) => {
  try {
    const article = req.body;
    const articles = LocalDatabase.getArticles();

    const existsIdx = articles.findIndex(a => a.id === article.id);
    if (existsIdx > -1) {
      articles[existsIdx] = article;
    } else {
      articles.unshift(article);
    }

    LocalDatabase.saveArticles(articles);
    res.json({ success: true, article });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/articles/save-all", (req, res) => {
  try {
    const articles = req.body;
    if (!Array.isArray(articles)) {
      return res.status(400).json({ error: "Payload must be an array of articles" });
    }
    LocalDatabase.saveArticles(articles);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/articles/:id", (req, res) => {
  try {
    const { id } = req.params;
    const articles = LocalDatabase.getArticles();
    const filtered = articles.filter(a => a.id !== id);
    LocalDatabase.saveArticles(filtered);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// System Settings
app.get("/api/settings", (req, res) => {
  try {
    const settings = LocalDatabase.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.frequency || !Array.isArray(payload.divisions) || !Array.isArray(payload.aiTools)) {
      return res.status(400).json({ error: "Invalid settings format" });
    }
    
    const { renameEvent, ...settings } = payload;
    
    if (renameEvent) {
      const { type, oldVal, newVal } = renameEvent;
      if (type === 'division' && oldVal && newVal) {
        LocalDatabase.renameDivision(oldVal, newVal);
      } else if (type === 'ai' && oldVal && newVal) {
        LocalDatabase.renameAiTool(oldVal, newVal);
      }
    } else {
      LocalDatabase.saveSettings(settings);
    }
    
    res.json(LocalDatabase.getSettings());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/qa-sheet", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.accessToken;
    let token = bodyToken;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(400).json({ error: "Access token Google wajib disertakan." });
    }

    const url = await createQASpreadsheet(token);
    res.json({ success: true, url });
  } catch (error: any) {
    console.error("Gagal membuat Google Sheet QA:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});
