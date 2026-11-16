import fs from 'fs';
import path from 'path';
import { Article, AILearningEntry, AppUser } from '../src/types';
import { INITIAL_MOCK_DATA } from '../src/data/mockData';

// Initial default articles
const INITIAL_ARTICLES: Article[] = [];

export interface SystemSettings {
  frequency: 'bulan' | '2minggu';
  divisions: string[];
  aiTools: string[];
}

export interface DatabaseSchema {
  users: Array<AppUser & { password?: string }>;
  entries: AILearningEntry[];
  articles: Article[];
  settings?: SystemSettings;
}

function getDbFilePath(): string {
  const rootDbPath = path.join(process.cwd(), 'database.json');
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      const tmpDbPath = path.join('/tmp', 'database.json');
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(rootDbPath)) {
        fs.copyFileSync(rootDbPath, tmpDbPath);
      }
      return tmpDbPath;
    } catch (err) {
      console.warn('Could not use /tmp for database, falling back to root path:', err);
    }
  }
  return rootDbPath;
}

export class LocalDatabase {
  private static loadRaw(): DatabaseSchema {
    const defaultUsers = [
      {
        id: 'usr-admin',
        username: 'admin',
        name: 'Super Admin',
        role: 'superadmin' as const,
        password: 'Superadmin@11',
        division: 'IT SOLUTION',
        position: 'Lead Admin',
        email: 'admin@vascomm.co.id',
        joinDate: '2026-01-01',
        status: 'active' as const,
        passwordResetRequest: 'none' as const
      }
    ];

    const dbFilePath = getDbFilePath();
    if (!fs.existsSync(dbFilePath)) {
      const defaultDb: DatabaseSchema = {
        users: defaultUsers,
        entries: INITIAL_MOCK_DATA,
        articles: INITIAL_ARTICLES
      };
      try {
        fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write initial defaultDb to file:', err);
      }
      return defaultDb;
    }

    try {
      const data = fs.readFileSync(dbFilePath, 'utf-8');
      const parsed = JSON.parse(data) as DatabaseSchema;
      
      // Auto-migrate users if missing some properties or using legacy divisions
      let migrated = false;
      // Load valid divisions from settings dynamically to prevent wiping out custom divisions
      const validDivs = parsed.settings?.divisions || ['IT SOLUTION', 'ISS', 'MARKETING', 'FINANCE', 'HCM', 'PRODUCT & UI/UX', 'DATA & ANALYTICS'];

      parsed.users = parsed.users.map(u => {
        let changed = false;
        if (u.username === 'admin' && u.role !== 'superadmin') { u.role = 'superadmin'; changed = true; }
        if (!u.status) { u.status = 'active'; changed = true; }
        if (!u.passwordResetRequest) { u.passwordResetRequest = 'none'; changed = true; }
        
        // Migrate legacy division to uppercase valid ones
        const oldDiv = u.division || '';
        let newDiv = oldDiv.trim();
        if (
          !newDiv ||
          newDiv === 'Vascomm Division' ||
          newDiv === 'IT Support' ||
          newDiv === 'Operations' ||
          newDiv === 'IT / Management' ||
          newDiv === 'Produksi' ||
          newDiv === 'Design / Creative' ||
          newDiv === 'Product Management' ||
          newDiv === 'Finance & Legal' ||
          newDiv === 'Umum'
        ) {
          newDiv = 'IT SOLUTION';
        } else if (newDiv === 'HR & People' || newDiv === 'SDM' || newDiv.toUpperCase() === 'HCM') {
          newDiv = 'HCM';
        } else if (newDiv.toLowerCase() === 'marketing' || newDiv === 'Pemasaran') {
          newDiv = 'MARKETING';
        } else if (newDiv.toLowerCase() === 'finance' || newDiv === 'Keuangan') {
          newDiv = 'FINANCE';
        } else if (newDiv.toLowerCase() === 'iss') {
          newDiv = 'ISS';
        }
        
        if (!validDivs.includes(newDiv)) {
          newDiv = validDivs[0] || 'IT SOLUTION';
        }

        if (u.division !== newDiv) {
          u.division = newDiv;
          changed = true;
        }

        if (!u.position) { u.position = (u.role === 'admin' || u.role === 'superadmin') ? 'Lead Admin' : 'Karyawan'; changed = true; }
        if (!u.email) { u.email = `${u.username}@vascomm.co.id`; changed = true; }
        if (!u.joinDate) { u.joinDate = '2026-06-01'; changed = true; }
        if (changed) migrated = true;
        return u;
      });

      // Auto-migrate entries if using legacy divisions
      if (parsed.entries && Array.isArray(parsed.entries)) {
        parsed.entries = parsed.entries.map(e => {
          const oldDiv = e.divisi || '';
          let newDiv = oldDiv.trim();
          if (
            !newDiv ||
            newDiv === 'Vascomm Division' ||
            newDiv === 'IT Support' ||
            newDiv === 'Operations' ||
            newDiv === 'IT / Management' ||
            newDiv === 'Produksi' ||
            newDiv === 'Design / Creative' ||
            newDiv === 'Product Management' ||
            newDiv === 'Finance & Legal' ||
            newDiv === 'Umum'
          ) {
            newDiv = 'IT SOLUTION';
          } else if (newDiv === 'HR & People' || newDiv === 'SDM' || newDiv.toUpperCase() === 'HCM') {
            newDiv = 'HCM';
          } else if (newDiv.toLowerCase() === 'marketing' || newDiv === 'Pemasaran') {
            newDiv = 'MARKETING';
          } else if (newDiv.toLowerCase() === 'finance' || newDiv === 'Keuangan') {
            newDiv = 'FINANCE';
          } else if (newDiv.toLowerCase() === 'iss') {
            newDiv = 'ISS';
          }
          
          if (!validDivs.includes(newDiv)) {
            newDiv = validDivs[0] || 'IT SOLUTION';
          }
          
          if (e.divisi !== newDiv) {
            e.divisi = newDiv;
            migrated = true;
          }
          return e;
        });
      }

      if (migrated) {
        try {
          fs.writeFileSync(dbFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch (err) {
          console.warn('Could not write migrated DB to file:', err);
        }
      }

      return parsed;
    } catch (e) {
      console.error('Error reading database file, using fallback and re-writing.', e);
      const fallbackDb: DatabaseSchema = {
        users: defaultUsers,
        entries: INITIAL_MOCK_DATA,
        articles: INITIAL_ARTICLES
      };
      try {
        fs.writeFileSync(dbFilePath, JSON.stringify(fallbackDb, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write fallback DB to file:', err);
      }
      return fallbackDb;
    }
  }

  private static saveRaw(data: DatabaseSchema) {
    const dbFilePath = getDbFilePath();
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not save raw DB data to file:', err);
    }
  }

  // Users
  public static getUsers(): Array<AppUser & { password?: string }> {
    return this.loadRaw().users;
  }

  public static addUser(user: AppUser & { password?: string }) {
    const db = this.loadRaw();
    db.users.push(user);
    this.saveRaw(db);
  }

  public static updateUser(userId: string, updates: Partial<AppUser & { password?: string }>) {
    const db = this.loadRaw();
    db.users = db.users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    this.saveRaw(db);
  }

  public static deleteUser(userId: string) {
    const db = this.loadRaw();
    db.users = db.users.filter(u => u.id !== userId);
    this.saveRaw(db);
  }

  // Entries (Learning Reports)
  public static getEntries(): AILearningEntry[] {
    return this.loadRaw().entries;
  }

  public static saveEntries(entries: AILearningEntry[]) {
    const db = this.loadRaw();
    db.entries = entries;
    this.saveRaw(db);
  }

  // Articles
  public static getArticles(): Article[] {
    return this.loadRaw().articles;
  }

  public static saveArticles(articles: Article[]) {
    const db = this.loadRaw();
    db.articles = articles;
    this.saveRaw(db);
  }

  // Settings
  public static getSettings(): SystemSettings {
    const db = this.loadRaw();
    if (!db.settings) {
      return {
        frequency: 'bulan',
        divisions: ['IT SOLUTION', 'ISS', 'MARKETING', 'FINANCE', 'HCM', 'PRODUCT & UI/UX', 'DATA & ANALYTICS'],
        aiTools: ['Gemini', 'ChatGPT', 'Claude', 'v0 by Vercel', 'Cursor', 'GitHub Copilot', 'Canva AI', 'Midjourney', 'DeepSeek', 'Perplexity', 'Lainnya']
      };
    }
    return {
      frequency: db.settings.frequency || 'bulan',
      divisions: db.settings.divisions || ['IT SOLUTION', 'ISS', 'MARKETING', 'FINANCE', 'HCM', 'PRODUCT & UI/UX', 'DATA & ANALYTICS'],
      aiTools: db.settings.aiTools || ['Gemini', 'ChatGPT', 'Claude', 'v0 by Vercel', 'Cursor', 'GitHub Copilot', 'Canva AI', 'Midjourney', 'DeepSeek', 'Perplexity', 'Lainnya']
    };
  }

  public static saveSettings(settings: SystemSettings) {
    const db = this.loadRaw();
    db.settings = settings;
    this.saveRaw(db);
  }

  public static renameDivision(oldVal: string, newVal: string) {
    const db = this.loadRaw();
    // 1. Update settings
    if (db.settings) {
      if (db.settings.divisions) {
        db.settings.divisions = db.settings.divisions.map(d => d === oldVal ? newVal : d);
      }
    } else {
      db.settings = {
        frequency: 'bulan',
        divisions: ['IT SOLUTION', 'ISS', 'MARKETING', 'FINANCE', 'HCM', 'PRODUCT & UI/UX', 'DATA & ANALYTICS'].map(d => d === oldVal ? newVal : d),
        aiTools: ['Gemini', 'ChatGPT', 'Claude', 'v0 by Vercel', 'Cursor', 'GitHub Copilot', 'Canva AI', 'Midjourney', 'DeepSeek', 'Perplexity', 'Lainnya']
      };
    }
    // 2. Update users
    db.users = db.users.map(u => {
      if (u.division && u.division.trim().toUpperCase() === oldVal.trim().toUpperCase()) {
        return { ...u, division: newVal };
      }
      return u;
    });
    // 3. Update entries
    db.entries = db.entries.map(e => {
      if (e.divisi && e.divisi.trim().toUpperCase() === oldVal.trim().toUpperCase()) {
        return { ...e, divisi: newVal };
      }
      return e;
    });
    this.saveRaw(db);
  }

  public static renameAiTool(oldVal: string, newVal: string) {
    const db = this.loadRaw();
    // 1. Update settings
    if (db.settings) {
      if (db.settings.aiTools) {
        db.settings.aiTools = db.settings.aiTools.map(t => t === oldVal ? newVal : t);
      }
    } else {
      db.settings = {
        frequency: 'bulan',
        divisions: ['IT SOLUTION', 'ISS', 'MARKETING', 'FINANCE', 'HCM', 'PRODUCT & UI/UX', 'DATA & ANALYTICS'],
        aiTools: ['Gemini', 'ChatGPT', 'Claude', 'v0 by Vercel', 'Cursor', 'GitHub Copilot', 'Canva AI', 'Midjourney', 'DeepSeek', 'Perplexity', 'Lainnya'].map(t => t === oldVal ? newVal : t)
      };
    }
    // 2. Update entries
    db.entries = db.entries.map(e => {
      if (e.aiYangDipakai && e.aiYangDipakai.trim().toLowerCase() === oldVal.trim().toLowerCase()) {
        return { ...e, aiYangDipakai: newVal };
      }
      return e;
    });
    this.saveRaw(db);
  }
}
