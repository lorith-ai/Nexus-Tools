import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  X, 
  Command, 
  LayoutGrid, 
  List as ListIcon, 
  Tag,
  Monitor,
  Cpu,
  PenTool,
  Briefcase,
  Globe,
  Cloud,
  Loader2,
  Database,
  Moon,
  Sun,
  Star,
  StickyNote,
  Zap,
  Settings,
  Code,
  Box,
  Terminal,
  Smartphone,
  Video,
  Music,
  Image as ImageIcon,
  Book,
  Coffee,
  Smile,
  AlertCircle,
  Network,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Wand2,
  RefreshCw,
  ArrowLeftRight,
  History,
  FileJson,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  LogIn,
  User,
  Mail,
  Github,
  Lock,
  UserPlus
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  writeBatch, 
  orderBy, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAk9DRbjEXtrxZO__be8jdvg0nd9eyb6kA",
  authDomain: "nexustoolskit.firebaseapp.com",
  projectId: "nexustoolskit",
  storageBucket: "nexustoolskit.firebasestorage.app",
  messagingSenderId: "48980205740",
  appId: "1:48980205740:web:06f85aa41a7468a25a7f09",
  measurementId: "G-S2R7WWL4D8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// App ID for data separation (keep as is)
const appId = 'nexus-tools-v1'; 

// --- CONFIGURATION ---
const APP_NAME = "Nexus Tools";
const LOGO_URL = ""; // Add your logo URL here if you have one hosted
const apiKey = "AIzaSyDd1mDT9FtixzQWF75OsAKfmdCadfr7VCI"; // Your Gemini API Key

// 1. Icon Mapping
const ICON_MAP = {
  LayoutGrid, Star, Cpu, Monitor, PenTool, Zap, Globe,
  Code, Box, Terminal, Smartphone, Video, Music, ImageIcon,
  Book, Coffee, Smile, Briefcase, Tag, AlertCircle, Network, Sparkles, FileJson, CreditCard
};

// 2. Color Palettes
const COLOR_PALETTES = {
  teal: { label: 'Teal', color: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500', shadow: 'shadow-teal-500/20', ring: 'ring-teal-500/20' },
  yellow: { label: 'Yellow', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500', shadow: 'shadow-yellow-500/20', ring: 'ring-yellow-500/20' },
  purple: { label: 'Purple', color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500/20', ring: 'ring-purple-500/20' },
  blue: { label: 'Blue', color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500/20', ring: 'ring-blue-500/20' },
  pink: { label: 'Pink', color: 'text-pink-400', bg: 'bg-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500/20', ring: 'ring-pink-500/20' },
  orange: { label: 'Orange', color: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500/20', ring: 'ring-orange-500/20' },
  emerald: { label: 'Emerald', color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20', ring: 'ring-emerald-500/20' },
  red: { label: 'Red', color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-red-500/20', ring: 'ring-red-500/20' },
  gray: { label: 'Gray', color: 'text-neutral-400', bg: 'bg-neutral-500', border: 'border-neutral-500', shadow: 'shadow-neutral-500/20', ring: 'ring-neutral-500/20' },
  indigo: { label: 'Indigo', color: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500', shadow: 'shadow-indigo-500/20', ring: 'ring-indigo-500/20' },
  cyan: { label: 'Cyan', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20', ring: 'ring-cyan-500/20' },
};

// 3. Default Categories
const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'LayoutGrid', theme: 'teal', isSystem: true, order: 0 },
  { id: 'favorites', label: 'Favs', icon: 'Star', theme: 'yellow', isSystem: true, order: 1 },
  { id: 'ai', label: 'AI', icon: 'Cpu', theme: 'purple', order: 2 },
  { id: 'dev', label: 'Dev', icon: 'Monitor', theme: 'blue', order: 3 },
  { id: 'design', label: 'Design', icon: 'PenTool', theme: 'pink', order: 4 },
  { id: 'workflow', label: 'Flow', icon: 'Zap', theme: 'orange', order: 5 },
  { id: 'resource', label: 'Ref', icon: 'Globe', theme: 'emerald', order: 6 },
];

const SAMPLE_DATA = [
  { name: 'ChatGPT', version: '4o', link: 'https://chat.openai.com', category: 'ai', useCase: 'General purpose reasoning & code.', notes: 'Use Code Interpreter.', isFavorite: true, cost: 20, billingCycle: 'monthly' },
  { name: 'Figma', version: 'Latest', link: 'https://figma.com', category: 'design', useCase: 'UI/UX design & prototyping.', notes: 'Cmd+/ for quick actions.', isFavorite: false },
  { name: 'Linear', version: 'Web', link: 'https://linear.app', category: 'workflow', useCase: 'Issue tracking for engineering.', notes: '', isFavorite: true, cost: 8, billingCycle: 'monthly' }
];

// 4. Fallback Recommendations
const DEFAULT_RECOMMENDATIONS = [
  { name: 'V0', version: 'Beta', link: 'https://v0.dev', category: 'ai', useCase: 'Generate UI components with AI prompts.', icon: 'Cpu' },
  { name: 'Midjourney', version: 'v6', link: 'https://discord.com', category: 'ai', useCase: 'High-fidelity AI image generation.', icon: 'Cpu' },
  { name: 'Notion', version: 'Web', link: 'https://notion.so', category: 'workflow', useCase: 'All-in-one workspace for notes & docs.', icon: 'Book' },
  { name: 'Vercel', version: 'Platform', link: 'https://vercel.com', category: 'dev', useCase: 'Frontend cloud for React/Next.js.', icon: 'Cloud' },
  { name: 'Supabase', version: 'Postgres', link: 'https://supabase.com', category: 'dev', useCase: 'Open source Firebase alternative.', icon: 'Database' },
];

export default function App() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Modals
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [editingTool, setEditingTool] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCurating, setIsCurating] = useState(false);
  
  // Settings State
  const [darkMode, setDarkMode] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);

  // Form States
  const [toolFormData, setToolFormData] = useState({ 
    name: '', version: '', link: '', category: 'resource', useCase: '', notes: '', isFavorite: false,
    workflowJson: null, workflowName: '',
    cost: '', billingCycle: 'monthly', currency: '$'
  });
  const [categoryFormData, setCategoryFormData] = useState({ label: '', icon: 'Box', theme: 'blue', id: null });
  const [replaceFormData, setReplaceFormData] = useState({ name: '', link: '', version: '', notes: '' });
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  // ---------------------------------------------------------------------------
  // 1. Authentication
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth failed:", error);
        setLoading(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Data Sync
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    
    // Tools
    const toolsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tools');
    const unsubTools = onSnapshot(query(toolsRef), (snapshot) => {
      const fetchedTools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedTools.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        return a.isFavorite ? -1 : 1;
      });
      setTools(fetchedTools);
      setLoading(false);
    });

    // Categories
    const catsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'categories');
    const unsubCats = onSnapshot(query(catsRef, orderBy('order')), async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_CATEGORIES.forEach(cat => batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', cat.id), cat));
        await batch.commit();
      } else {
        const fetchedCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedCats.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(fetchedCats);
      }
    });

    // Settings & Recommendations
    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
    const unsubSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.showRecommendations !== undefined) setShowRecommendations(data.showRecommendations);
        if (data.customRecommendations && Array.isArray(data.customRecommendations)) {
          setRecommendations(data.customRecommendations);
        }
      }
    });

    return () => { unsubTools(); unsubCats(); unsubSettings(); };
  }, [user]);

  // ---------------------------------------------------------------------------
  // 3. AI Features (Gemini)
  // ---------------------------------------------------------------------------
  
  // Feature A: Auto-Fill Tool Details
  const handleAutoFill = async (targetFormSetter, currentForm) => {
    if (!currentForm.name && !currentForm.link) {
      alert("Please enter a Name or Link to auto-fill.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const categoryList = categories.filter(c => !c.isSystem).map(c => c.id).join(", ");
      const prompt = `I am adding a tool to my developer toolbox.
      Name: "${currentForm.name}"
      Link: "${currentForm.link}"
      
      Available Categories IDs: [${categoryList}, "ai", "dev", "design", "workflow", "resource"]
      
      Task:
      1. Identify what this tool does.
      2. Write a concise 1-sentence 'useCase' (max 10 words).
      3. Select the SINGLE best category ID from the list provided.
      4. Write a short 'notes' (max 15 words) mentioning a key feature or pro tip.
      
      Return strictly a JSON object: { "useCase": string, "category": string, "notes": string, "version": "latest stable version number or 'Web'" }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('Gemini API Error');
      
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      
      targetFormSetter(prev => ({
        ...prev,
        useCase: result.useCase || prev.useCase,
        category: result.category || 'resource',
        notes: result.notes || prev.notes,
        version: result.version || prev.version
      }));
    } catch (e) {
      console.error(e);
      alert("Could not auto-fill. Please try again or fill manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Feature B: AI Curator (Refresh Recommendations)
  const refreshRecommendations = async () => {
    if (!user) return;
    setIsCurating(true);
    try {
      const currentTools = tools.map(t => t.name).join(", ");
      const prompt = `I have a developer toolbox with these tools: [${currentTools}].
      
      Task: Suggest 5 NEW, high-quality tools that I am missing but would likely find useful based on my current list.
      Do NOT suggest tools I already have.
      
      For each tool, provide:
      - name
      - version (e.g. "Web", "v2")
      - link (homepage)
      - category (choose from: ai, dev, design, workflow)
      - useCase (max 8 words pitch)
      - icon (choose closest Lucide icon name from: Cpu, Code, PenTool, Zap, Globe, Database, Cloud)
      
      Return strictly a JSON object with a key "recommendations" containing an array of 5 tool objects.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('Gemini API Error');

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      
      if (result.recommendations && Array.isArray(result.recommendations)) {
        setRecommendations(result.recommendations);
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), { 
          customRecommendations: result.recommendations 
        }, { merge: true });
      }
    } catch (e) {
      console.error(e);
      alert("AI Curator is taking a nap. Try again later.");
    } finally {
      setIsCurating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Tool Actions (Add, Edit, Replace)
  // ---------------------------------------------------------------------------
  const handleOpenToolModal = (tool = null) => {
    if (tool) {
      setEditingTool(tool);
      setToolFormData({ 
        ...tool, 
        workflowJson: tool.workflowJson || null, 
        workflowName: tool.workflowName || '',
        cost: tool.cost || '',
        billingCycle: tool.billingCycle || 'monthly',
        currency: tool.currency || '$'
      });
    } else {
      setEditingTool(null);
      setToolFormData({ 
        name: '', version: '', link: '', category: 'resource', useCase: '', notes: '', isFavorite: false, 
        workflowJson: null, workflowName: '',
        cost: '', billingCycle: 'monthly', currency: '$'
      });
    }
    setIsToolModalOpen(true);
  };

  const handleToolSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const toolData = { ...toolFormData, dateAdded: editingTool ? (editingTool.dateAdded || new Date().toISOString()) : new Date().toISOString() };
      const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tools');
      editingTool ? await updateDoc(doc(colRef, editingTool.id), toolData) : await addDoc(colRef, toolData);
      setIsToolModalOpen(false);
    } catch (error) { console.error("Error saving tool:", error); }
    setIsSaving(false);
  };

  const handleToolDelete = async (id) => {
    if (!user || !window.confirm('Delete this tool?')) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tools', id)); } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (tool, e) => {
    e.stopPropagation();
    if (!user) return;
    try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tools', tool.id), { isFavorite: !tool.isFavorite }); } catch (e) { console.error(e); }
  };

  const handleWorkflowUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        setToolFormData(prev => ({ ...prev, workflowJson: JSON.stringify(json, null, 2), workflowName: file.name }));
      } catch (err) { alert('Invalid JSON file.'); }
    };
    reader.readAsText(file);
  };

  const handleOpenReplaceModal = (tool) => {
    setEditingTool(tool);
    setReplaceFormData({
      name: '',
      link: '',
      version: '',
      notes: tool.notes || '',
      useCase: tool.useCase, 
      category: tool.category
    });
    setIsReplaceModalOpen(true);
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editingTool) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tools', editingTool.id);
      const archivalNote = `[Replaced ${editingTool.name} on ${new Date().toLocaleDateString()}]`;
      const newNotes = replaceFormData.notes ? `${replaceFormData.notes}\n${archivalNote}` : archivalNote;

      await updateDoc(docRef, {
        name: replaceFormData.name,
        link: replaceFormData.link,
        version: replaceFormData.version,
        notes: newNotes,
        dateAdded: new Date().toISOString(),
        workflowJson: null,
        workflowName: '',
        cost: '', billingCycle: 'monthly' // Reset cost on replace
      });
      
      setIsReplaceModalOpen(false);
      setEditingTool(null);
    } catch(e) { console.error(e); }
    setIsSaving(false);
  };

  const addRecommendation = async (rec) => {
    if (!user) return;
    try {
      const exists = tools.some(t => t.name.toLowerCase() === rec.name.toLowerCase());
      if (exists) return alert("You already have this tool!");

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tools'), {
        ...rec,
        dateAdded: new Date().toISOString(),
        notes: `Added from recommendations. ${rec.useCase}`,
        isFavorite: false
      });
    } catch (e) { console.error("Error adding rec:", e); }
  };

  const loadSampleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const promises = SAMPLE_DATA.map(item => addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tools'), { ...item, dateAdded: new Date().toISOString() }));
      await Promise.all(promises);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // 5. Category & Settings Actions
  // ---------------------------------------------------------------------------
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const isEditing = !!categoryFormData.id;
      const catId = isEditing ? categoryFormData.id : categoryFormData.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
      const catData = { id: catId, label: categoryFormData.label, icon: categoryFormData.icon, theme: categoryFormData.theme, order: isEditing ? (categories.find(c => c.id === catId)?.order || 99) : categories.length + 1 };
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'categories', catId);
      isEditing ? await updateDoc(ref, catData) : await setDoc(ref, catData);
      setIsCategoryModalOpen(false);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleCategoryDelete = async (id) => {
    if (!user || ['all', 'favorites'].includes(id) || !window.confirm('Delete this category?')) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', id)); if (activeCategory === id) setActiveCategory('all'); } catch (e) { console.error(e); }
  };

  const toggleRecommendations = async () => {
    if (!user) return;
    const newVal = !showRecommendations;
    setShowRecommendations(newVal);
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), { showRecommendations: newVal }, { merge: true }); } catch (e) { console.error(e); }
  };

  // ---------------------------------------------------------------------------
  // 6. Authentication Actions
  // ---------------------------------------------------------------------------
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSaving(true);
    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        if (authForm.name) await updateProfile(cred.user, { displayName: authForm.name });
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
    setIsSaving(false);
  };

  const handleSocialLogin = async (providerName) => {
    setAuthError('');
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut(auth);
      // Automatically sign in anonymously again to show guest mode
      await signInAnonymously(auth);
      setIsSettingsModalOpen(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Stats & Render Helpers
  // ---------------------------------------------------------------------------
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = (tool.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (tool.useCase || '').toLowerCase().includes(searchTerm.toLowerCase());
      let matchesCategory = true;
      if (activeCategory === 'favorites') matchesCategory = tool.isFavorite;
      else if (activeCategory !== 'all') matchesCategory = tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, activeCategory]);

  const recommendedDisplay = useMemo(() => recommendations.filter(rec => !tools.some(t => t.name.toLowerCase() === rec.name.toLowerCase())), [tools, recommendations]);

  const subscriptionStats = useMemo(() => {
    const paidTools = tools.filter(t => t.cost && parseFloat(t.cost) > 0);
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    paidTools.forEach(t => {
      const cost = parseFloat(t.cost);
      if (t.billingCycle === 'monthly') {
        monthlyTotal += cost;
        yearlyTotal += cost * 12;
      } else if (t.billingCycle === 'yearly') {
        monthlyTotal += cost / 12;
        yearlyTotal += cost;
      }
    });

    return { monthlyTotal, yearlyTotal, paidTools };
  }, [tools]);

  const textClass = darkMode ? "text-neutral-100" : "text-slate-900";
  const headerBgClass = darkMode ? "bg-black/40 backdrop-blur-xl border-white/5" : "bg-white/80 backdrop-blur-md border-slate-200";
  const inputBgClass = darkMode ? "bg-white/5 border-white/10 text-white focus:border-white/20" : "bg-white border-slate-200 text-slate-800 focus:border-teal-500/50";

  return (
    <div className="min-h-screen font-sans transition-all duration-700" style={{ backgroundImage: darkMode ? 'linear-gradient(to bottom right, #000000, #1a1a1a)' : 'none', backgroundColor: darkMode ? '#000000' : '#f0f4f8' }}>
      
      {/* Navbar */}
      <header className={`sticky top-0 z-30 border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 ${headerBgClass}`}>
        <div className="flex items-center gap-3">
          {LOGO_URL ? <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain" /> : (
            <div className={`p-2 rounded-xl text-black shadow-lg ${darkMode ? 'bg-white' : 'bg-slate-900 text-white'}`}><Network size={20} strokeWidth={3} /></div>
          )}
          <div>
            <h1 className={`text-xl font-bold leading-none ${textClass}`}>{APP_NAME}</h1>
            <div className="flex items-center gap-1 mt-1">
              {user?.isAnonymous ? (
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 text-yellow-500"><User size={9} /> Guest Mode</span>
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 text-green-400"><Cloud size={9} /> {user?.displayName || user?.email || 'Synced'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/30' : 'text-slate-400'}`} size={16} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-48 pl-9 pr-4 py-2 rounded-xl text-sm outline-none border focus:ring-0 ${inputBgClass}`} />
          </div>
          
          <button onClick={() => setIsSubscriptionModalOpen(true)} className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 text-green-400' : 'bg-slate-200 hover:bg-slate-300 text-green-600'}`} title="Subscriptions">
            <CreditCard size={18} />
          </button>

          <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 text-yellow-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user?.isAnonymous ? (
            <button onClick={() => setIsAuthModalOpen(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-teal-500 text-white hover:bg-teal-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              <LogIn size={18} strokeWidth={3} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <button onClick={() => setIsSettingsModalOpen(true)} className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 text-neutral-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}>
              <Settings size={18} />
            </button>
          )}

          <button onClick={() => handleOpenToolModal()} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-48">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10 items-center justify-center">
          <div className={`flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-x-auto max-w-full no-scrollbar ${darkMode ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'}`}>
            {categories.map(cat => {
              const theme = COLOR_PALETTES[cat.theme] || COLOR_PALETTES.gray;
              const isActive = activeCategory === cat.id;
              const Icon = ICON_MAP[cat.icon] || ICON_MAP.Box;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${isActive ? `${theme.bg} text-white shadow-lg` : `${darkMode ? 'text-neutral-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}`}>
                  <Icon size={14} strokeWidth={2.5} className={isActive ? 'opacity-100' : 'opacity-70'} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className={`hidden sm:flex p-1 rounded-xl border backdrop-blur-md ${darkMode ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : 'text-neutral-500'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : 'text-neutral-500'}`}><ListIcon size={16} /></button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-50"><Loader2 className="animate-spin mb-4 text-white" size={40} /><p className="text-white text-sm">LOADING...</p></div>
        ) : filteredTools.length === 0 ? (
          <div className={`text-center py-20 border-2 border-dashed rounded-3xl max-w-2xl mx-auto ${darkMode ? 'bg-black/20 border-white/5 text-neutral-300' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}><Database className="opacity-40" size={32} /></div>
            <h3 className="text-xl font-bold mb-2">No tools found</h3>
            <div className="flex gap-4 justify-center mt-6"><button onClick={loadSampleData} className={`px-6 py-3 border font-semibold rounded-xl transition-all ${darkMode ? 'border-white/20 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>Load Examples</button></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3 max-w-4xl mx-auto"}>
            {filteredTools.map(tool => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                categories={categories} 
                viewMode={viewMode} 
                onEdit={() => handleOpenToolModal(tool)} 
                onReplace={() => handleOpenReplaceModal(tool)}
                onDelete={() => handleToolDelete(tool.id)} 
                onToggleFavorite={(e) => toggleFavorite(tool, e)} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        )}

        {/* Recommendation Bar */}
        {showRecommendations && (
          <div className="fixed bottom-0 left-0 right-0 z-20 p-6 pointer-events-none">
            <div className={`max-w-5xl mx-auto rounded-3xl shadow-2xl border p-5 backdrop-blur-xl pointer-events-auto transform transition-all hover:-translate-y-1 ${darkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className={`font-bold flex items-center gap-2 ${textClass}`}><Sparkles size={16} className="text-yellow-400 fill-yellow-400" /> AI Curator</h3>
                  <button onClick={refreshRecommendations} disabled={isCurating} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {isCurating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Refresh
                  </button>
                </div>
                <button onClick={toggleRecommendations} className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-slate-100 text-slate-400'}`}><X size={16} /></button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {recommendedDisplay.slice(0, 5).map((rec, i) => (
                  <div key={i} className={`flex-shrink-0 w-64 p-4 rounded-xl border flex flex-col gap-2 group ${darkMode ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold ${textClass}`}>{rec.name}</h4>
                      <button onClick={() => addRecommendation(rec)} className="p-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"><Plus size={14} strokeWidth={3} /></button>
                    </div>
                    <p className={`text-xs line-clamp-2 ${darkMode ? 'text-white' : 'text-slate-600 opacity-80'}`}>{rec.useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- AUTH MODAL --- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold ${textClass}`}>Welcome to Nexus</h2>
              <button onClick={() => setIsAuthModalOpen(false)}><X size={20} className={textClass} /></button>
            </div>
            
            <div className="p-8">
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => handleSocialLogin('google')} className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${darkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <Mail size={18} /> Google
                </button>
                <button onClick={() => handleSocialLogin('github')} className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${darkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <Github size={18} /> GitHub
                </button>
              </div>

              <div className="relative flex items-center py-2 mb-6">
                <div className={`flex-grow border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
                <span className={`flex-shrink-0 mx-4 text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-neutral-500' : 'text-slate-400'}`}>Or continue with</span>
                <div className={`flex-grow border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-neutral-500' : 'text-slate-500'}`}>Full Name</label>
                    <div className={`flex items-center px-4 py-3 border rounded-xl ${inputBgClass}`}>
                      <User size={16} className="opacity-50 mr-3" />
                      <input required type="text" placeholder="John Doe" className="bg-transparent w-full outline-none" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-neutral-500' : 'text-slate-500'}`}>Email</label>
                  <div className={`flex items-center px-4 py-3 border rounded-xl ${inputBgClass}`}>
                    <Mail size={16} className="opacity-50 mr-3" />
                    <input required type="email" placeholder="you@example.com" className="bg-transparent w-full outline-none" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-neutral-500' : 'text-slate-500'}`}>Password</label>
                  <div className={`flex items-center px-4 py-3 border rounded-xl ${inputBgClass}`}>
                    <Lock size={16} className="opacity-50 mr-3" />
                    <input required type="password" placeholder="••••••••" className="bg-transparent w-full outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                  </div>
                </div>

                {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}

                <button type="submit" className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-70" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
                  className={`text-sm font-medium hover:underline ${darkMode ? 'text-neutral-400' : 'text-slate-500'}`}
                >
                  {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBSCRIPTION MODAL --- */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${textClass}`}><CreditCard size={22} className="text-green-400" /> Subscription Tracker</h2>
              <button onClick={() => setIsSubscriptionModalOpen(false)}><X size={20} className={textClass} /></button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Monthly</div>
                  <div className={`text-2xl font-bold ${textClass}`}>${subscriptionStats.monthlyTotal.toFixed(2)}</div>
                </div>
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Yearly</div>
                  <div className={`text-2xl font-bold ${textClass}`}>${subscriptionStats.yearlyTotal.toFixed(2)}</div>
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold opacity-40 uppercase tracking-widest ${textClass}`}>Active Subscriptions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {subscriptionStats.paidTools.length === 0 ? (
                    <p className="text-sm opacity-50 italic">No paid subscriptions tracked.</p>
                  ) : (
                    subscriptionStats.paidTools.map(t => (
                      <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`font-semibold ${textClass}`}>{t.name}</span>
                        <div className="text-right">
                          <div className={`font-bold ${textClass}`}>${t.cost}</div>
                          <div className="text-[10px] uppercase opacity-50">{t.billingCycle}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MASTER SETTINGS MODAL --- */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${textClass}`}><Settings size={22} /> Master Settings</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textClass}`}><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Account Section */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold opacity-40 uppercase tracking-widest ${textClass}`}>Account</h3>
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                    {user?.displayName ? user.displayName[0] : (user?.email ? user.email[0].toUpperCase() : 'G')}
                  </div>
                  <div>
                    <div className={`font-bold ${textClass}`}>{user?.displayName || 'Guest User'}</div>
                    <div className="text-xs opacity-50">{user?.email || 'Anonymous Session'}</div>
                  </div>
                </div>
              </div>

              {/* General Section */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold opacity-40 uppercase tracking-widest ${textClass}`}>General</h3>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg"><Sparkles size={18} /></div>
                    <div>
                      <div className={`font-semibold ${textClass}`}>Recommendations</div>
                      <div className="text-xs opacity-50">Show suggested tools bar</div>
                    </div>
                  </div>
                  <button onClick={toggleRecommendations} className={`text-2xl transition-colors ${showRecommendations ? 'text-teal-400' : 'text-neutral-500'}`}>
                    {showRecommendations ? <ToggleRight size={36} className="fill-teal-400/20" /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              </div>

              {/* Data Section */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold opacity-40 uppercase tracking-widest ${textClass}`}>Data & Customization</h3>
                <button onClick={() => { setIsSettingsModalOpen(false); setIsCategoryModalOpen(true); }} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><LayoutGrid size={18} /></div>
                    <div className={`font-semibold ${textClass}`}>Manage Categories</div>
                  </div>
                  <ExternalLink size={16} className="opacity-50" />
                </button>
              </div>

              {/* System Section */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold opacity-40 uppercase tracking-widest ${textClass}`}>System</h3>
                <button onClick={handleSignOut} className={`w-full flex items-center gap-3 p-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all ${darkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                  <LogOut size={18} />
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REPLACE TOOL MODAL --- */}
      {isReplaceModalOpen && editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg"><ArrowLeftRight size={20} /></div>
                <div>
                  <h2 className={`text-xl font-bold leading-none ${textClass}`}>Replace Tool</h2>
                  <p className="text-xs opacity-50 mt-1">Found a better alternative?</p>
                </div>
              </div>
              <button onClick={() => { setIsReplaceModalOpen(false); setEditingTool(null); }}><X size={20} className={textClass} /></button>
            </div>
            
            <form onSubmit={handleReplaceSubmit} className="p-8 space-y-6">
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Replacing</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-bold text-lg ${textClass} line-through opacity-60`}>{editingTool.name}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">For Use Case</div>
                <div className={`text-sm italic ${darkMode ? 'text-white' : 'text-slate-900'}`}>"{editingTool.useCase}"</div>
              </div>

              <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 text-white rounded-lg"><Wand2 size={16} /></div>
                  <div className={`text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>AI Auto-Fill</div>
                </div>
                <button type="button" onClick={() => handleAutoFill(setReplaceFormData, replaceFormData)} disabled={isGenerating} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20">{isGenerating ? <Loader2 size={14} className="animate-spin" /> : "Auto-Fill ✨"}</button>
              </div>

              <input required placeholder="New Tool Name" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={replaceFormData.name} onChange={e => setReplaceFormData({...replaceFormData, name: e.target.value})} />
              <input required placeholder="New Tool URL" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={replaceFormData.link} onChange={e => setReplaceFormData({...replaceFormData, link: e.target.value})} />
              
              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => { setIsReplaceModalOpen(false); setEditingTool(null); }} className={`flex-1 px-4 py-3.5 border rounded-xl font-bold transition-colors ${darkMode ? 'border-white/10 hover:bg-white/5 text-neutral-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`} disabled={isSaving}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-400 shadow-lg" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirm Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TOOL FORM MODAL (Updated) --- */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold ${textClass}`}>{editingTool ? 'Edit Tool' : 'New Tool'}</h2>
              <button onClick={() => setIsToolModalOpen(false)}><X size={20} className={textClass} /></button>
            </div>
            <form onSubmit={handleToolSubmit} className="p-8 space-y-6 overflow-y-auto">
              
              {/* AI Auto-Fill */}
              {!editingTool && (
                <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 text-white rounded-lg"><Wand2 size={16} /></div>
                    <div>
                      <div className={`text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>AI Auto-Fill</div>
                      <div className={`text-xs ${darkMode ? 'text-purple-300/60' : 'text-purple-600/70'}`}>Enter name/link then click here</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleAutoFill(setToolFormData, toolFormData)} disabled={isGenerating} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20">{isGenerating ? <Loader2 size={14} className="animate-spin" /> : "Auto-Fill ✨"}</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={toolFormData.name} onChange={e => setToolFormData({...toolFormData, name: e.target.value})} />
                <input placeholder="Version" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={toolFormData.version} onChange={e => setToolFormData({...toolFormData, version: e.target.value})} />
              </div>
              
              <input required placeholder="URL" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={toolFormData.link} onChange={e => setToolFormData({...toolFormData, link: e.target.value})} />
              
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => !c.isSystem).map(cat => (
                  <button key={cat.id} type="button" onClick={() => setToolFormData({...toolFormData, category: cat.id})} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${toolFormData.category === cat.id ? 'bg-teal-500 text-white border-teal-500' : 'border-white/10 text-neutral-400'}`}>{cat.label}</button>
                ))}
              </div>
              
              <textarea placeholder="Use case description..." rows={2} className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none resize-none ${inputBgClass}`} value={toolFormData.useCase} onChange={e => setToolFormData({...toolFormData, useCase: e.target.value})} />
              <textarea placeholder="Notes..." rows={2} className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none resize-none ${inputBgClass}`} value={toolFormData.notes} onChange={e => setToolFormData({...toolFormData, notes: e.target.value})} />

              {/* Cost/Subscription Fields */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                    <DollarSign size={16} /> Track Cost
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">$</span>
                    <input type="number" placeholder="0.00" className={`w-full pl-7 pr-3 py-2 rounded-lg text-sm bg-transparent border outline-none ${inputBgClass}`} value={toolFormData.cost} onChange={e => setToolFormData({...toolFormData, cost: e.target.value})} />
                  </div>
                  <select className={`w-full px-3 py-2 rounded-lg text-sm bg-transparent border outline-none ${inputBgClass}`} value={toolFormData.billingCycle} onChange={e => setToolFormData({...toolFormData, billingCycle: e.target.value})}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
              </div>

              {/* Workflow Upload */}
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${toolFormData.workflowJson ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10 hover:border-white/20'}`}>
                <input type="file" id="workflow-upload" className="hidden" accept=".json" onChange={handleWorkflowUpload} />
                <label htmlFor="workflow-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileJson size={24} className={toolFormData.workflowJson ? 'text-teal-400' : 'opacity-50'} />
                  <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {toolFormData.workflowName ? toolFormData.workflowName : "Attach ComfyUI Workflow (.json)"}
                  </span>
                </label>
                {toolFormData.workflowJson && (
                  <button type="button" onClick={() => setToolFormData({...toolFormData, workflowJson: null, workflowName: ''})} className="text-[10px] text-red-400 mt-2 hover:underline">Remove</button>
                )}
              </div>

              <button type="submit" className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-400" disabled={isSaving}>Save Tool</button>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY FORM MODAL (Existing) --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className={`rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b flex justify-between ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold ${textClass}`}>Manage Categories</h2>
              <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} className={textClass} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <input required placeholder="Category Name" className={`w-full px-4 py-3 border rounded-xl bg-transparent outline-none ${inputBgClass}`} value={categoryFormData.label} onChange={e => setCategoryFormData({...categoryFormData, label: e.target.value})} />
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(COLOR_PALETTES).map(k => <button key={k} type="button" onClick={() => setCategoryFormData({...categoryFormData, theme: k})} className={`w-6 h-6 rounded-full ${COLOR_PALETTES[k].bg} ${categoryFormData.theme === k ? 'ring-2 ring-white' : ''}`} />)}
                </div>
                <button type="submit" className="w-full py-3 bg-white text-black rounded-xl font-bold">Save Category</button>
              </form>
              <div className="space-y-2">
                {categories.filter(c => !c.isSystem).map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 border border-white/10 rounded-xl">
                    <span className={textClass}>{cat.label}</span>
                    <button onClick={() => handleCategoryDelete(cat.id)}><Trash2 size={16} className="text-red-400" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ToolCard({ tool, categories, viewMode, onEdit, onReplace, onDelete, onToggleFavorite, darkMode }) {
  const cat = categories.find(c => c.id === tool.category) || categories.find(c => c.id === 'resource') || { label: 'Ref', theme: 'gray', icon: 'Box' };
  const theme = COLOR_PALETTES[cat.theme] || COLOR_PALETTES.gray;
  const Icon = ICON_MAP[cat.icon] || ICON_MAP.Box;
  const cardRef = useRef(null);
  
  // Favicon Logic
  const faviconUrl = useMemo(() => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`; } catch { return null; }
  }, [tool.link]);

  const [imgError, setImgError] = useState(false);
  const IconCmp = (!imgError && faviconUrl) ? <img src={faviconUrl} className="w-full h-full object-contain rounded-md" onError={() => setImgError(true)} /> : <Icon size={20} />;

  // Tilt Effect
  const handleMove = (e) => {
    if (viewMode === 'list' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  const handleLeave = () => { if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'; };

  // Workflow Download
  const downloadWorkflow = (e) => {
    e.stopPropagation();
    if (!tool.workflowJson) return;
    const blob = new Blob([tool.workflowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tool.workflowName || `${tool.name.replace(/\s+/g, '_')}_workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cardBase = darkMode ? `bg-black/40 border-white/5 hover:border-white/20 hover:shadow-2xl` : `bg-white border-slate-200 hover:shadow-xl`;
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';

  if (viewMode === 'list') {
    return (
      <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${cardBase}`}>
        <div className={`w-10 h-10 p-2 rounded-lg flex items-center justify-center ${theme.bg} bg-opacity-20 ${theme.color}`}>{IconCmp}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate ${textTitle}`}>{tool.name}</h3>
            {tool.isFavorite && <Star size={12} className="text-yellow-400 fill-current" />}
            {tool.workflowJson && <FileJson size={12} className="text-teal-400" />}
            {tool.cost && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">${tool.cost}/{tool.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
          </div>
          <p className={`text-xs truncate ${darkMode ? 'text-white/70' : 'text-slate-600/70'}`}>{tool.useCase}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {tool.workflowJson && <button onClick={downloadWorkflow} className="p-2 hover:bg-white/10 rounded-lg text-teal-400"><Download size={16} /></button>}
          <button onClick={onReplace} title="Replace Tool" className="p-2 hover:bg-white/10 text-teal-400 rounded-lg"><ArrowLeftRight size={16} /></button>
          <a href={tool.link} target="_blank" className="p-2 hover:bg-white/10 rounded-lg"><ExternalLink size={16} className="opacity-50" /></a>
          <button onClick={onEdit} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={16} /></button>
        </div>
      </div>
    )
  }

  return (
    <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`group relative p-6 rounded-3xl border flex flex-col gap-4 transition-all duration-200 ${cardBase}`} style={{ transformStyle: 'preserve-3d' }}>
      <div className="flex justify-between items-start" style={{ transform: 'translateZ(20px)' }}>
        <div className={`w-12 h-12 p-2.5 rounded-2xl flex items-center justify-center shadow-inner ${theme.bg} bg-opacity-20 ${theme.color}`}>{IconCmp}</div>
        <button onClick={onToggleFavorite} className={`p-2 rounded-full hover:bg-white/10 ${tool.isFavorite ? 'text-yellow-400' : 'text-neutral-600'}`}><Star size={18} className={tool.isFavorite ? 'fill-current' : ''} /></button>
      </div>
      <div style={{ transform: 'translateZ(10px)' }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-lg font-bold ${textTitle}`}>{tool.name}</h3>
          <div className="flex gap-1">
            {tool.cost && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                ${tool.cost}/{tool.billingCycle === 'monthly' ? 'mo' : (tool.billingCycle === 'yearly' ? 'yr' : '')}
              </span>
            )}
            {tool.workflowJson && (
              <button 
                onClick={downloadWorkflow} 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${darkMode ? 'border-teal-500/30 text-teal-300 hover:bg-teal-500/10' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}
                title="Download Workflow"
              >
                <FileJson size={10} /> JSON
              </button>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.color}`}>{cat.label}</span>
        <p className={`text-sm mt-2 leading-relaxed ${darkMode ? 'text-white/90' : 'text-slate-600'}`}>{tool.useCase}</p>
      </div>
      <div className={`pt-4 mt-auto border-t flex justify-between items-center ${darkMode ? 'border-white/5' : 'border-slate-100'}`} style={{ transform: 'translateZ(15px)' }}>
        <div className="flex gap-1">
          <button onClick={onReplace} title="Replace Tool" className="p-2 hover:bg-teal-500/10 text-teal-400 rounded-lg transition-colors"><ArrowLeftRight size={14} /></button>
          <button onClick={onEdit} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
          <button onClick={onDelete} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 size={14} /></button>
        </div>
        <a href={tool.link} target="_blank" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ${theme.color}`}>Open <ExternalLink size={10} /></a>
      </div>
    </div>
  );
}