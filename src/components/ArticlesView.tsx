import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Eye,
  ArrowLeft,
  Send,
  X,
  AlertCircle,
  UploadCloud,
  Star,
  Check
} from 'lucide-react';
import { Article, AppUser } from '../types';
import { EMPLOYEES } from '../data/employees';

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'Tutorial Setup AI Skill di Claude & Gemini AI Studio',
    category: 'Tutorial Setup Skill',
    createdAt: '2026-06-25',
    author: 'RAFI FIRMANSYAH',
    imageUrl: '/images/article_skill_setup.jpg',
    content: `### Panduan Praktis Integrasi AI Skill di Workspace Anda

Selamat datang di tutorial setup AI Skill! Dalam artikel ini, kita akan mempelajari langkah-langkah mudah mengonfigurasi AI skill kustom menggunakan Gemini API dan Claude.

#### Persyaratan Sebelum Memulai
1. Memiliki API Key dari **Google AI Studio** atau **Anthropic Console**.
2. Node.js versi 18 ke atas terinstal di komputer Anda.
3. Repositori proyek siap digunakan.`
  },
  {
    id: 'art-002',
    title: 'Update AI Terbaru: Era Agentic AI dan Otomatisasi Pekerjaan',
    category: 'Update AI',
    createdAt: '2026-06-26',
    author: 'REVAN RAMADHAN',
    imageUrl: '/images/article_ai_agents.jpg',
    content: `### Mengapa Agentic AI Menjadi Standar Baru Industri Tech?

Sistem AI telah berkembang pesat dari sekadar chatbot pasif menjadi Agentic AI yang proaktif mengambil keputusan dan menjalankan perintah terstruktur.`
  }
];

const CATEGORY_OPTIONS = [
  'Update AI',
  'Tutorial Setup Skill',
  'Setup AI Project',
  'Lainnya'
];

const compressAndResizeImage = (fileOrDataUrl: File | string): Promise<string> => {
  return new Promise((resolve) => {
    const handleImgLoad = (img: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxDimension = 1200;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      } else if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      const img = document.createElement('img');
      img.onload = () => handleImgLoad(img);
      img.onerror = () => resolve(fileOrDataUrl);
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => handleImgLoad(img);
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
};

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  onSelectImage: (src: string, alt: string) => void;
}

const MarkdownImage: React.FC<MarkdownImageProps> = ({ src, alt, onSelectImage }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (!src) {
      setHasError(true);
      return;
    }

    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) setHasError(true);
      else setIsLoaded(true);
      return;
    }

    const tempImg = document.createElement('img');
    tempImg.src = src;

    if (tempImg.complete) {
      if (tempImg.naturalWidth === 0) setHasError(true);
      else setIsLoaded(true);
      return;
    }

    tempImg.onload = () => {
      if (tempImg.naturalWidth === 0) setHasError(true);
      else setIsLoaded(true);
    };
    tempImg.onerror = () => setHasError(true);

    return () => {
      tempImg.onload = null;
      tempImg.onerror = null;
    };
  }, [src]);

  return (
    <div className="my-6 flex flex-col items-center w-full">
      <div
        className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden max-w-full transition group ${
          !isLoaded && !hasError ? 'min-h-[160px] w-full flex items-center justify-center' : ''
        }`}
      >
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs gap-2 z-10">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent" />
            Memuat gambar...
          </div>
        )}
        {hasError ? (
          <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl w-full">
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Gambar tidak ditemukan
            </span>
            <span className="text-[11px] text-slate-400 max-w-md truncate">{src}</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className={`max-w-full max-h-[500px] h-auto object-contain transition duration-300 cursor-zoom-in ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            onClick={() => {
              if (src) onSelectImage(src, alt || '');
            }}
          />
        )}
      </div>
      {alt && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          {alt}
        </span>
      )}
    </div>
  );
};

const migrateRawBase64Images = (
  content: string,
  articleId: string
): { migratedContent: string; images: Record<string, string> } => {
  const images: Record<string, string> = {};
  let counter = 1;

  const migratedContent = content.replace(
    /!\[(.*?)\]\((data:image\/[a-zA-Z0-9+]+;base64,[a-zA-Z0-9+/=\s\r\n]+)\)/g,
    (_, altText, base64Data) => {
      const cleanBase64 = base64Data.replace(/[\s\r\n]+/g, '');
      const imageId = `img_${articleId}_${counter}_${Date.now()}`;
      images[imageId] = cleanBase64;
      counter++;
      return `![${altText}](media:${imageId})`;
    }
  );

  return { migratedContent, images };
};

export default function ArticlesView({ currentUser }: { currentUser?: AppUser | null }) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [statusFilter, setStatusFilter] = useState<'published' | 'pending'>('published');

  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Update AI');
  const [formAuthor, setFormAuthor] = useState('RAFI FIRMANSYAH');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentUser) {
      setFormAuthor(currentUser.name);
    }
  }, [currentUser]);

  const [showInlineImageHelper, setShowInlineImageHelper] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');
  const [inlineImageAlt, setInlineImageAlt] = useState('Screenshot Deskripsi');
  const [inlineImageDragActive, setInlineImageDragActive] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [draftImages, setDraftImages] = useState<Record<string, string>>({});
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  const [highlightReplacementTarget, setHighlightReplacementTarget] = useState<Article | null>(null);
  const [showReplacementModal, setShowReplacementModal] = useState(false);

  const isArtPublished = (art: Article) => art.status === 'published' || !art.status;

  const canEdit = (art: Article) => {
    if (isArtPublished(art)) return false;
    return (
      isAdmin ||
      (currentUser?.role === 'karyawan' &&
        art.author.trim().toLowerCase() === currentUser?.name.trim().toLowerCase())
    );
  };

  const canDelete = (art: Article) => {
    if (isArtPublished(art)) return isAdmin;
    return (
      isAdmin ||
      (currentUser?.role === 'karyawan' &&
        art.author.trim().toLowerCase() === currentUser?.name.trim().toLowerCase())
    );
  };

  const handleToggleHighlight = (art: Article) => {
    if (art.highlighted) {
      const updated = articles.map(a => (a.id === art.id ? { ...a, highlighted: false } : a));
      saveArticles(updated);
    } else {
      const currentHighlighted = articles.filter(
        a => a.highlighted && (a.status === 'published' || !a.status)
      );
      if (currentHighlighted.length >= 3) {
        setHighlightReplacementTarget(art);
        setShowReplacementModal(true);
      } else {
        const updated = articles.map(a => (a.id === art.id ? { ...a, highlighted: true } : a));
        saveArticles(updated);
      }
    }
  };

  const handleReplaceHighlight = (oldArtId: string, newArt: Article) => {
    const updated = articles.map(a => {
      if (a.id === oldArtId) return { ...a, highlighted: false };
      if (a.id === newArt.id) return { ...a, highlighted: true };
      return a;
    });
    saveArticles(updated);
    setShowReplacementModal(false);
    setHighlightReplacementTarget(null);
  };

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          let hasChanges = false;
          const migrated = data.map(art => {
            if (art.content && art.content.includes('data:image/')) {
              const { migratedContent, images } = migrateRawBase64Images(art.content, art.id);
              if (migratedContent !== art.content) {
                hasChanges = true;
                return {
                  ...art,
                  content: migratedContent,
                  images: { ...(art.images || {}), ...images }
                };
              }
            }
            return art;
          });

          if (hasChanges) {
            fetch('/api/articles/save-all', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(migrated)
            }).catch(() => {});
            setArticles(migrated);
          } else {
            setArticles(data);
          }
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('degree_ai_tracker_articles');
        if (stored) {
          try {
            setArticles(JSON.parse(stored) as Article[]);
          } catch {
            setArticles(INITIAL_ARTICLES);
          }
        } else {
          setArticles(INITIAL_ARTICLES);
        }
      });
  }, []);

  const saveArticles = async (updated: Article[]) => {
    try {
      localStorage.setItem('degree_ai_tracker_articles', JSON.stringify(updated));
      setArticles(updated);

      await fetch('/api/articles/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      return true;
    } catch (e: any) {
      const isQuotaError =
        e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22;
      setFormErrors(prev => ({
        ...prev,
        content: isQuotaError
          ? 'Penyimpanan lokal penuh. Kurangi ukuran gambar lampiran sebelum menyimpan.'
          : `Gagal menyimpan artikel: ${e.message || 'Kesalahan browser'}`
      }));
      return false;
    }
  };

  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsCompressing(true);
    try {
      const compressed = await compressAndResizeImage(file);
      setFormImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setFormImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleInlineImageUpload = async (file: File) => {
    setIsCompressing(true);
    try {
      const compressed = await compressAndResizeImage(file);
      setInlineImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setInlineImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInlineDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setInlineImageDragActive(true);
    else if (e.type === 'dragleave') setInlineImageDragActive(false);
  };

  const handleInlineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInlineImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleInlineImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setIsCompressing(true);
          try {
            const compressedBase64 = await compressAndResizeImage(file);
            const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            setDraftImages(prev => ({ ...prev, [imageId]: compressedBase64 }));

            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const timestamp = new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const markdownImg = `\n\n![Screenshot ${timestamp}](media:${imageId})\n\n`;
            setFormContent(text.substring(0, start) + markdownImg + text.substring(end));

            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start + markdownImg.length, start + markdownImg.length);
            }, 50);
          } finally {
            setIsCompressing(false);
          }
        }
        break;
      }
    }
  };

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormCategory('Update AI');
    setFormAuthor(currentUser?.name || EMPLOYEES[0]?.nama || 'RAFI FIRMANSYAH');
    setFormImageUrl('');
    setFormContent(
      `### Ringkasan Topik\n\nTulis penjelasan utama Anda di sini.\n\n#### Langkah Implementasi:\n- Langkah pertama\n- Langkah kedua\n\n> Catatan penting atau tips penerapan di divisi.`
    );
    setFormErrors({});
    setDraftImages({});
    setEditorTab('write');
    setIsCreating(true);
    setEditingArticle(null);
  };

  const handleOpenEdit = (art: Article) => {
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormAuthor(art.author);
    setFormImageUrl(art.imageUrl || '');
    setFormContent(art.content);
    setFormErrors({});
    setDraftImages(art.images || {});
    setEditorTab('write');
    setEditingArticle(art);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!formTitle.trim()) errors.title = 'Judul artikel wajib diisi';
    if (!formContent.trim()) errors.content = 'Isi artikel wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const referencedImages: Record<string, string> = {};
    if (draftImages) {
      Object.entries(draftImages).forEach(([imgId, base64]) => {
        if (formContent.includes(imgId)) referencedImages[imgId] = base64;
      });
    }

    const savedArticle: Article = {
      id: editingArticle ? editingArticle.id : `art-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      author: !isAdmin ? currentUser?.name || '' : formAuthor,
      content: formContent,
      imageUrl: formImageUrl.trim() || '/images/article_prompt_engineering.jpg',
      createdAt: editingArticle ? editingArticle.createdAt : new Date().toISOString().split('T')[0],
      images: referencedImages,
      status: editingArticle ? editingArticle.status || 'published' : 'pending'
    };

    const updatedArticles = editingArticle
      ? articles.map(a => (a.id === editingArticle.id ? savedArticle : a))
      : [savedArticle, ...articles];

    saveArticles(updatedArticles);
    setIsCreating(false);
    setEditingArticle(null);
    setViewingArticle(savedArticle);
    setStatusFilter(savedArticle.status === 'pending' ? 'pending' : 'published');
  };

  const handleDelete = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    saveArticles(updated);
    if (viewingArticle?.id === id) setViewingArticle(null);
    setDeletingId(null);
  };

  const handleApproveArticle = (id: string) => {
    const updated = articles.map(art =>
      art.id === id ? { ...art, status: 'published' as const } : art
    );
    saveArticles(updated);
    const approvedArt = updated.find(a => a.id === id);
    if (approvedArt) setViewingArticle(approvedArt);
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua Kategori' || art.category === selectedCategory;

    const isPublished = art.status === 'published' || art.status === undefined;
    const isPending = art.status === 'pending';

    if (statusFilter === 'published') {
      return matchesSearch && matchesCategory && isPublished;
    }
    if (isAdmin) {
      return matchesSearch && matchesCategory && isPending;
    }
    const isMyPending =
      isPending && art.author.trim().toLowerCase() === currentUser?.name.trim().toLowerCase();
    return matchesSearch && matchesCategory && isMyPending;
  });

  const injectMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || 'teks') + suffix;
    setFormContent(text.substring(0, start) + replacement + text.substring(end));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected || 'teks').length
      );
    }, 50);
  };

  const insertInlineImageContent = (url: string, alt: string) => {
    const textarea = document.getElementById('markdown-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const altText = alt.trim() || 'Gambar';
    const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setDraftImages(prev => ({ ...prev, [imageId]: url }));

    const markdownImg = `\n\n![${altText}](media:${imageId})\n\n`;
    setFormContent(text.substring(0, start) + markdownImg + text.substring(end));
    setShowInlineImageHelper(false);
    setInlineImageUrl('');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdownImg.length, start + markdownImg.length);
    }, 50);
  };

  const pendingCountForUser = isAdmin
    ? articles.filter(a => a.status === 'pending').length
    : articles.filter(
        a =>
          a.status === 'pending' &&
          a.author.trim().toLowerCase() === currentUser?.name.trim().toLowerCase()
      ).length;

  const highlightedArticles = articles.filter(
    a => a.highlighted && (a.status === 'published' || !a.status)
  );

  return (
    <div className="w-full space-y-6" id="articles-section">
      {/* 1. READING FULL ARTICLE */}
      {viewingArticle && !isCreating && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <button
              onClick={() => setViewingArticle(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Kembali ke Daftar Artikel
            </button>

            <div className="flex items-center gap-2">
              {isAdmin && viewingArticle.status === 'pending' && (
                <button
                  onClick={() => handleApproveArticle(viewingArticle.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D655E] px-3.5 py-2 rounded-lg transition cursor-pointer"
                >
                  <Check size={14} /> Setujui &amp; Terbitkan
                </button>
              )}
              {canEdit(viewingArticle) && (
                <button
                  onClick={() => handleOpenEdit(viewingArticle)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <Edit2 size={13} /> Sunting
                </button>
              )}
              {canDelete(viewingArticle) &&
                (deletingId === viewingArticle.id ? (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(viewingArticle.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(viewingArticle.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {viewingArticle.status === 'pending' && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs rounded-xl leading-relaxed">
                  <strong>Menunggu Persetujuan Admin:</strong> Draft artikel ini belum dipublikasikan ke seluruh karyawan.
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    {viewingArticle.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{viewingArticle.author}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{viewingArticle.createdAt}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {viewingArticle.title}
                </h1>
              </div>

              {viewingArticle.imageUrl && (
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={viewingArticle.imageUrl}
                    alt={viewingArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="max-w-none text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6">
                <ReactMarkdown
                  urlTransform={(uri) => uri}
                  components={{
                    img: ({ ...props }) => {
                      let resolvedSrc = props.src || '';
                      try {
                        resolvedSrc = decodeURIComponent(resolvedSrc);
                      } catch {}

                      if (resolvedSrc.includes('media:') || resolvedSrc.includes('media-')) {
                        const match = resolvedSrc.match(/media[:-]([a-zA-Z0-9_]+)/);
                        const imgId = match ? match[1] : '';
                        resolvedSrc = (viewingArticle.images && viewingArticle.images[imgId]) || '';
                      }
                      return (
                        <MarkdownImage
                          src={resolvedSrc}
                          alt={props.alt}
                          onSelectImage={(src, alt) => setLightboxImage({ src, alt })}
                        />
                      );
                    },
                    h1: ({ ...props }) => (
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2" {...props} />
                    ),
                    h4: ({ ...props }) => (
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1.5" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5" {...props} />,
                    li: ({ ...props }) => <li {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 py-4 rounded-xl italic text-slate-700 dark:text-slate-300 my-5"
                        {...props}
                      />
                    ),
                    code: ({ inline, children, ...props }: any) =>
                      !inline ? (
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono leading-relaxed my-4">
                          <code className="block whitespace-pre" {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code
                          className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-teal-700 dark:text-teal-300"
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    hr: ({ ...props }) => <hr className="border-slate-200 dark:border-slate-800 my-6" {...props} />
                  }}
                >
                  {viewingArticle.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Informasi Artikel
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {viewingArticle.author.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {viewingArticle.author}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Kontributor Degree</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Kategori</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {viewingArticle.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Tanggal Terbit</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      {viewingArticle.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE / EDIT ARTICLE */}
      {isCreating && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingArticle ? 'Sunting Artikel' : 'Tulis Artikel Baru'}
            </h2>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Artikel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={`w-full text-sm px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg border ${
                      formErrors.title ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600`}
                    placeholder="Contoh: Panduan Setup Skill Gemini untuk Tim QA"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kategori <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Penulis <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      disabled={!isAdmin}
                      className="w-full text-sm px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 disabled:opacity-70"
                    >
                      {currentUser &&
                        !EMPLOYEES.some(
                          emp => emp.nama.toLowerCase() === currentUser.name.toLowerCase()
                        ) && <option value={currentUser.name}>{currentUser.name}</option>}
                      {EMPLOYEES.map(emp => (
                        <option key={emp.nama} value={emp.nama}>
                          {emp.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gambar Sampul (Opsional)
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                      dragActive
                        ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/60 dark:bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="article-image-file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="article-image-file" className="cursor-pointer space-y-1.5 block">
                      <UploadCloud size={24} className="text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tarik gambar ke sini atau pilih file
                      </p>
                      <p className="text-[11px] text-slate-500">Mendukung PNG, JPG, GIF</p>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="mt-2.5 w-full text-xs px-3.5 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                    placeholder="Atau masukkan path / URL gambar sampul"
                  />

                  {formImageUrl && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={formImageUrl}
                        className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
                        alt="Preview Sampul"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-600 rounded-full text-white hover:bg-rose-700 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full space-y-2.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Konten Artikel (Markdown) <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        editorTab === 'write'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Tulis
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                        editorTab === 'preview'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Pratinjau
                    </button>
                  </div>
                </div>

                {editorTab === 'write' && (
                  <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => injectMarkdown('### ')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => injectMarkdown('**', '**')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => injectMarkdown('*', '*')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded italic text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => injectMarkdown('\n- ')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => injectMarkdown('\n> ')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Kutipan
                    </button>
                    <button
                      type="button"
                      onClick={() => injectMarkdown('\n```typescript\n', '\n```')}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Kode
                    </button>
                    <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => setShowInlineImageHelper(!showInlineImageHelper)}
                      className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded text-xs font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon size={12} /> Sisipkan Gambar
                    </button>
                  </div>
                )}

                {showInlineImageHelper && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Sisipkan Gambar ke Artikel
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowInlineImageHelper(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onDragEnter={handleInlineDrag}
                        onDragOver={handleInlineDrag}
                        onDragLeave={handleInlineDrag}
                        onDrop={handleInlineDrop}
                        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer ${
                          inlineImageDragActive
                            ? 'border-teal-600 bg-teal-50/40'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="file"
                          id="inline-image-file-input"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleInlineImageUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="inline-image-file-input" className="cursor-pointer block space-y-1">
                          <UploadCloud size={18} className="text-slate-400 mx-auto" />
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Pilih file screenshot
                          </p>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={inlineImageUrl}
                          onChange={(e) => setInlineImageUrl(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700"
                          placeholder="Atau URL gambar"
                        />
                        <input
                          type="text"
                          value={inlineImageAlt}
                          onChange={(e) => setInlineImageAlt(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700"
                          placeholder="Keterangan gambar"
                        />
                      </div>
                    </div>
                    {inlineImageUrl && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => insertInlineImageContent(inlineImageUrl, inlineImageAlt)}
                          className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Sisipkan
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 flex flex-col min-h-[280px] relative">
                  {editorTab === 'write' ? (
                    <textarea
                      id="markdown-editor-textarea"
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      onPaste={handleTextareaPaste}
                      className={`w-full flex-1 text-xs p-4 bg-white dark:bg-slate-900 rounded-lg border ${
                        formErrors.content ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                      } text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden focus:border-teal-600 resize-none min-h-[260px] leading-relaxed`}
                      placeholder="Tulis panduan atau catatan pembelajaran AI dengan format Markdown..."
                    />
                  ) : (
                    <div className="w-full flex-1 p-5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-y-auto max-h-[420px] min-h-[260px] text-sm leading-relaxed">
                      <ReactMarkdown>{formContent || '_Belum ada konten._'}</ReactMarkdown>
                    </div>
                  )}

                  {isCompressing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex items-center justify-center rounded-lg z-20 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Mengoptimalkan gambar...
                    </div>
                  )}

                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Anda dapat menempelkan screenshot langsung dengan Ctrl+V di dalam editor.
                  </p>

                  {formErrors.content && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.content}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-semibold transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Send size={14} /> Simpan Artikel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ARTICLES LIST */}
      {!viewingArticle && !isCreating && (
        <div className="space-y-6">
          {/* Status Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex gap-6">
              <button
                onClick={() => setStatusFilter('published')}
                className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'published'
                    ? 'border-[#0F766E] dark:border-teal-400 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Artikel Terbit ({articles.filter(a => a.status === 'published' || !a.status).length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap tabular-nums ${
                  statusFilter === 'pending'
                    ? 'border-[#0F766E] dark:border-teal-400 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isAdmin ? 'Persetujuan Draft' : 'Draft Saya'} ({pendingCountForUser})
              </button>
            </div>
          </div>

          {/* Highlighted Articles */}
          {statusFilter === 'published' && highlightedArticles.length > 0 && (
            <div className="space-y-4" id="highlighted-articles-section">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bacaan Pilihan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rekomendasi panduan AI dan pembaruan utama dari tim Admin (maksimal 3 artikel).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {highlightedArticles.map(art => (
                  <div
                    key={`highlight-${art.id}`}
                    className="group flex flex-col bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-600/60 overflow-hidden transition"
                  >
                    <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <img
                        src={art.imageUrl || '/images/article_prompt_engineering.jpg'}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                          <span className="font-semibold text-teal-700 dark:text-teal-400">
                            {art.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{art.createdAt}</span>
                        </div>

                        <h4
                          onClick={() => setViewingArticle(art)}
                          className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition line-clamp-2 leading-snug cursor-pointer"
                        >
                          {art.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {art.content.replace(/[#*`>_-]/g, '').trim()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                          onClick={() => setViewingArticle(art)}
                          className="font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          Baca artikel <Eye size={13} />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleToggleHighlight(art)}
                            className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium transition cursor-pointer"
                          >
                            Hapus Pilihan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
                placeholder="Cari judul, konten, atau penulis..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0F766E] hover:bg-[#0D655E] text-white px-4 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} /> Tulis Artikel
              </button>
            </div>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
              <BookOpen size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada artikel yang cocok
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Ubah kata kunci pencarian atau tulis artikel panduan baru.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <Plus size={14} /> Tulis Artikel Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredArticles.map(art => (
                <div
                  key={art.id}
                  className="group flex flex-col bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden transition"
                >
                  <div
                    onClick={() => setViewingArticle(art)}
                    className="aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    <img
                      src={art.imageUrl || '/images/article_prompt_engineering.jpg'}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          {art.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[140px]">{art.author}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{art.createdAt}</span>
                      </div>

                      <h3
                        onClick={() => setViewingArticle(art)}
                        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition line-clamp-2 leading-snug cursor-pointer"
                      >
                        {art.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {art.content.replace(/[#*`>_-]/g, '').trim()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => setViewingArticle(art)}
                        className="font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Baca selengkapnya
                      </button>

                      <div className="flex items-center gap-1">
                        {isAdmin && isArtPublished(art) && (
                          <button
                            onClick={() => handleToggleHighlight(art)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              art.highlighted
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={art.highlighted ? 'Hapus dari Pilihan' : 'Jadikan Bacaan Pilihan'}
                          >
                            <Star size={14} className={art.highlighted ? 'fill-amber-500' : ''} />
                          </button>
                        )}
                        {isAdmin && art.status === 'pending' && (
                          <button
                            onClick={() => handleApproveArticle(art.id)}
                            className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-md text-xs transition cursor-pointer"
                          >
                            Terbitkan
                          </button>
                        )}
                        {canEdit(art) && (
                          <button
                            onClick={() => handleOpenEdit(art)}
                            title="Sunting Artikel"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {canDelete(art) &&
                          (deletingId === art.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(art.id)}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-xs font-semibold cursor-pointer"
                              >
                                Hapus
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(art.id)}
                              title="Hapus Artikel"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-11 right-0 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-full border border-slate-700 transition cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {lightboxImage.alt && (
              <p className="mt-4 text-center text-slate-200 font-medium text-xs bg-slate-900/90 px-4 py-2 rounded-lg max-w-xl">
                {lightboxImage.alt}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPLACEMENT HIGHLIGHT MODAL */}
      <AnimatePresence>
        {showReplacementModal && highlightReplacementTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => {
              setShowReplacementModal(false);
              setHighlightReplacementTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ganti Artikel Pilihan
                </h3>
                <button
                  onClick={() => {
                    setShowReplacementModal(false);
                    setHighlightReplacementTarget(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Maksimal 3 artikel dapat dipilih secara bersamaan. Pilih artikel pilihan saat ini yang ingin digantikan dengan{' '}
                <strong className="text-slate-900 dark:text-white">
                  &ldquo;{highlightReplacementTarget.title}&rdquo;
                </strong>
                :
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {highlightedArticles.map(art => (
                  <button
                    key={`replace-option-${art.id}`}
                    onClick={() => handleReplaceHighlight(art.id, highlightReplacementTarget)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-600 bg-slate-50 dark:bg-slate-900 transition cursor-pointer"
                  >
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {art.category} · {art.author}
                    </span>
                    <span className="text-xs text-slate-900 dark:text-white font-semibold line-clamp-1 mt-0.5 block">
                      {art.title}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setShowReplacementModal(false);
                    setHighlightReplacementTarget(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
