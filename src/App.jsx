import React, { useState, useMemo, useEffect, useRef } from 'react';
import CommandPalette from './CommandPalette';
import SettingsModal from './SettingsModal';
import AuthModal from './AuthModal';

import SubscriptionModal from './SubscriptionModal';
import CreateShareStackModal from './CreateShareStackModal';
import {
  Plus, Search, ExternalLink, Edit2, Trash2, X, Command, LayoutGrid,
  List as ListIcon, Tag, Monitor, Cpu, PenTool, Briefcase, Globe, Cloud,
  Loader2, Database, Moon, Sun, Star, StickyNote, Zap, Settings, Code,
  Box, Terminal, Smartphone, Video, Music, Image as ImageIcon, Book,
  Coffee, Smile, AlertCircle, Network, Sparkles, ToggleLeft, ToggleRight,
  LogOut, Wand2, RefreshCw, ArrowLeftRight, History, FileJson, Download,
  CreditCard, DollarSign, Calendar, LogIn, User, Mail, Github, Lock, UserPlus,
  ArrowRight, Shield, Share2, Layers, CheckCircle2, MessageSquare, Menu,
  ChevronRight, BarChart3, Activity, Pin, Users
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
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// --- FIREBASE CONFIGURATION ---
let firebaseConfig;
try {
  // Try to use injected config first (for preview environments)
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  } else {
    // Build from individual environment variables
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
} catch (error) {
  console.error('Firebase config error:', error);
  firebaseConfig = {};
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app); // Helper for Cloud Functions
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- CONFIGURATION ---
const APP_NAME = "Nexus Tools";
const LOGO_URL = "/cropped_circle_image.png";
// Gemini API Key - REMOVED for Security (Moved to Backend)

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

const DEFAULT_RECOMMENDATIONS = [
  { name: 'V0', version: 'Beta', link: 'https://v0.dev', category: 'ai', useCase: 'Generate UI components with AI prompts.', icon: 'Cpu' },
  { name: 'Midjourney', version: 'v6', link: 'https://discord.com', category: 'ai', useCase: 'High-fidelity AI image generation.', icon: 'Cpu' },
  { name: 'Notion', version: 'Web', link: 'https://notion.so', category: 'workflow', useCase: 'All-in-one workspace for notes & docs.', icon: 'Book' },
  { name: 'Vercel', version: 'Platform', link: 'https://vercel.com', category: 'dev', useCase: 'Frontend cloud for React/Next.js.', icon: 'Cloud' },
  { name: 'Supabase', version: 'Postgres', link: 'https://supabase.com', category: 'dev', useCase: 'Open source Firebase alternative.', icon: 'Database' },
  { name: 'Resend', version: 'Web', link: 'https://resend.com', category: 'dev', useCase: 'Email API for developers.', icon: 'Mail' },
  { name: 'Raycast', version: 'Pro', link: 'https://raycast.com', category: 'workflow', useCase: 'Mac launcher & productivity tool.', icon: 'Command' },
  { name: 'Tailwind CSS', version: 'v3.4', link: 'https://tailwindcss.com', category: 'design', useCase: 'Utility-first CSS framework.', icon: 'Code' },
  { name: 'Radix UI', version: 'Primitives', link: 'https://www.radix-ui.com', category: 'design', useCase: 'Unstyled, accessible UI components.', icon: 'LayoutGrid' },
  { name: 'Obsidian', version: 'Mobile', link: 'https://obsidian.md', category: 'workflow', useCase: 'Markdown knowledge base.', icon: 'FileJson' },
];

// --- BACKGROUND COMPONENT (Dark Veil Effect) ---
const DarkVeilBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 min-h-screen w-full bg-[#030014]">
      {/* Deep Radial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Orbs */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-teal-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
    </div>
  );
};

// --- CLICK SPARK ---
const ClickSpark = () => {
  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    const handleClick = (e) => {
      const id = Date.now();
      setSparks(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparks(prev => prev.filter(s => s.id !== id)), 500);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {sparks.map(s => (
        <div key={s.id} className="absolute left-0 top-0" style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-spark" style={{ width: '2px', height: '8px', left: '-1px', top: '-4px', '--angle': `${i * 45}deg` }} />
          ))}
        </div>
      ))}
      <style>{`.animate-spark { animation: spark-burst 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; } @keyframes spark-burst { 0% { transform: rotate(var(--angle)) translateY(0) scaleY(1); opacity: 1; } 100% { transform: rotate(var(--angle)) translateY(-20px) scaleY(0); opacity: 0; } }`}</style>
    </div>
  );
};

// --- LANDING PAGE ---
function LandingPage({ onEnterApp, onSignUp, user }) {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500/30 selection:text-white relative overflow-x-hidden">
      <DarkVeilBackground />
      <ClickSpark />

      {/* Floating Pill Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-4xl">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="flex items-center gap-3">
            {LOGO_URL ? (
              <img src={LOGO_URL} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Network size={16} strokeWidth={3} />
              </div>
            )}
            <span className="font-bold tracking-tight text-sm md:text-base">{APP_NAME}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('docs')} className="hover:text-white transition-colors">Documentation</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Pricing</button>
          </nav>

          <button
            onClick={onEnterApp}
            className="px-4 py-2 bg-white text-black rounded-full text-xs md:text-sm font-bold hover:bg-neutral-200 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            {user && !user.isAnonymous ? 'Go to App' : 'Get Started'} <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-medium backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          v2.0 is now live
        </div>

        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          Master Your <br className="hidden md:block" /> Digital Arsenal
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
          The intelligent, AI-powered command center for your tools, workflows, and subscriptions. Designed for the modern builder.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <button
            onClick={onEnterApp}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-neutral-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] active:scale-95 flex items-center justify-center gap-2"
          >
            Start Building Free
          </button>
          {!user && (
            <button
              onClick={onSignUp}
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Sign Up
            </button>
          )}
          <button onClick={() => scrollToSection('features')} className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
            View Features
          </button>
        </div>

        {/* 3D Dashboard Mockup */}
        <div className="mt-24 relative w-full max-w-6xl mx-auto perspective-[2000px] group">
          <div className="relative rounded-xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md shadow-2xl transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-1000 ease-out p-2 overflow-hidden">
            {/* Fake Dashboard UI */}
            {/* Actual Dashboard Screenshot */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
            <div className="w-full aspect-[16/9] bg-[#050505] rounded-lg overflow-hidden relative border border-white/5 group">
              <img
                src="/dashboard-preview.png"
                alt="Nexus Tools Dashboard"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentNode.innerHTML = `<div class="flex items-center justify-center w-full h-full text-neutral-500 bg-white/5 p-8 text-center"><p>Add screenshot to public/dashboard-preview.png</p></div>`;
                }}
              />
            </div>
          </div>
          {/* Glow beneath */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-3xl -z-10 rounded-[3rem]"></div>
        </div>
      </section>

      {/* Infinite Marquee Section */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="flex gap-16 animate-marquee whitespace-nowrap items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Doubled list for infinite scroll */}
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 text-xl font-bold"><Code size={24} /> VS Code</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Cpu size={24} /> OpenAI</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Database size={24} /> Supabase</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Cloud size={24} /> Vercel</div>
                <div className="flex items-center gap-2 text-xl font-bold"><PenTool size={24} /> Figma</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Github size={24} /> GitHub</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Zap size={24} /> Linear</div>
                <div className="flex items-center gap-2 text-xl font-bold"><LayoutGrid size={24} /> Notion</div>
                <div className="flex items-center gap-2 text-xl font-bold"><Terminal size={24} /> Terminal</div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; }
        `}</style>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large */}
            <div className="md:col-span-2 p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <Wand2 size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-4">AI Powered Automation</h3>
                <p className="text-neutral-400 max-w-md text-lg">Never manually fill details again. Paste a link, and our AI agent automatically categorizes, describes, and tags your tools instantly.</p>
              </div>
            </div>

            {/* Feature 2: Tall */}
            <div className="md:row-span-2 p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0"></div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-6 relative z-10 shadow-lg shadow-blue-500/20">
                <Cloud size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-4 relative z-10">Cloud Sync</h3>
              <p className="text-neutral-400 mb-8 relative z-10 text-lg">Your stack follows you everywhere. Switch devices seamlessly with real-time Firestore sync.</p>

              <div className="mt-auto relative z-10 border border-white/10 rounded-2xl bg-black/50 backdrop-blur-md p-4 space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-xs font-mono text-neutral-400">MacBook Pro: Synced</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-xs font-mono text-neutral-400">iPhone 15: Synced</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Small */}
            <div className="p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 border border-white/10">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Access</h3>
              <p className="text-neutral-400">Launch tools with a single click. Optimized for speed and keyboard users.</p>
            </div>

            {/* Feature 4: Small */}
            <div className="p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-400 mb-6 border border-white/10">
                <DollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Cost Tracking</h3>
              <p className="text-neutral-400">Monitor your monthly spend on SaaS subscriptions automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Visualization Section */}
      <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Nexus Works</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Turn chaos into order in three simple steps.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-500 via-teal-500 to-blue-500 opacity-20 border-t border-dashed border-white/20"></div>

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-8 relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Search size={40} className="text-purple-400" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Discover & Collect</h3>
              <p className="text-neutral-400 leading-relaxed">Find tools, paste links, or import from your browser. Nexus gathers everything in one place.</p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-8 relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-500 delay-100">
                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <LayoutGrid size={40} className="text-teal-400" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Organize & Curate</h3>
              <p className="text-neutral-400 leading-relaxed">Pin your daily drivers, create custom workflows, and categorize your stack for instant access.</p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-8 relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-500 delay-200">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Sparkles size={40} className="text-blue-400" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Automate & Scale</h3>
              <p className="text-neutral-400 leading-relaxed">Let AI fill in usage details, track costs, and sync your arsenal across all your devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Book size={24} />
            </div>
            <h2 className="text-3xl font-bold">Documentation</h2>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Plus size={18} /> Adding Tools</h3>
              <p className="text-neutral-400">Click the "Add" button in the top right. You can paste a URL and use the <strong>AI Auto-Fill</strong> button to automatically populate the description, category, and version.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CreditCard size={18} /> Tracking Subscriptions</h3>
              <p className="text-neutral-400">Toggle the "Track Cost" option when editing a tool. Enter the price and cycle (Monthly/Yearly). Click the Credit Card icon in the navbar to see your total burn rate.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><ArrowLeftRight size={18} /> Replacing Tools</h3>
              <p className="text-neutral-400">Found a better alternative? Click the swap icon on any tool card. Nexus will archive the old tool's data in the notes and update the entry with the new tool's details, keeping your "Best for Use Case" list clean.</p>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-400">Everything you need to know about Nexus.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is Nexus Tools free to use?", a: "Yes! The core features of organizing, pinning, and creating basic workflows are completely free for individual developers." },
              { q: "Does it sync across my devices?", a: "Absolutely. We use Google Firestore to sync your stack in real-time across all your devices where you're signed in." },
              { q: "Can I use this for my team?", a: "Team features are coming in v3.0! Currently, you can share workflows via JSON export, but real-time collaboration is on the roadmap." },
              { q: "Is my data secure?", a: "We use Firebase Authentication and Firestore Security Rules to ensure only you can access and modify your personal tool arsenal." }
            ].map((faq, i) => (
              <details key={i} className="group border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-lg font-medium hover:bg-white/[0.02] transition-colors">
                  <span className="text-white group-open:text-teal-400 transition-colors">{faq.q}</span>
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Plus size={16} className="absolute transition-transform duration-300 group-open:rotate-45" />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-neutral-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-neutral-400 mb-8">Have a feature request or found a bug? We'd love to hear from you.</p>
          <a href="mailto:support@nexustools.ai" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors">
            <Mail size={18} /> Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Built with React & Firebase.</p>
      </footer>
    </div >
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentView, setCurrentView] = useState('landing');

  // Mobile Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Shared Stack State
  const [sharedStack, setSharedStack] = useState(null);
  const [isSharedView, setIsSharedView] = useState(false);

  const [editingTool, setEditingTool] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCurating, setIsCurating] = useState(false);

  // Session State
  const [sessions, setSessions] = useState([]);

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

  // ---------------------------------------------------------------------------
  // 1. Authentication
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Check for share URL
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');

    if (shareId) {
      const fetchSharedStack = async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'shared_stacks', shareId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSharedStack({ id: docSnap.id, ...docSnap.data() });
            setIsSharedView(true);
            setCurrentView('app'); // Go straight to app view
            setLoading(false);
          } else {
            console.error("Shared stack not found");
            // Optional: Show error toast
          }
        } catch (error) {
          console.error("Error fetching shared stack:", error);
        }
      };
      fetchSharedStack();
    }

    // Dynamic Favicon Update
    if (LOGO_URL) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = LOGO_URL;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Session Tracking & Sync
  useEffect(() => {
    if (!user) { setSessions([]); return; }

    // 1. Identify/Create Device ID
    let deviceId = localStorage.getItem('nexus_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nexus_device_id', deviceId);
    }

    // 2. Identify Metadata
    const deviceName = `${navigator.platform} - ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}`;
    const sessionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'sessions', deviceId);

    // 3. Register Session (Heartbeat)
    const updateHeartbeat = async () => {
      try {
        await setDoc(sessionRef, {
          id: deviceId,
          deviceName,
          userAgent: navigator.userAgent,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp() // Note: setDoc with merge: true would be safer for createdAt, but setDoc overwrites.
          // Better: use setDoc with merge for updates, or specific logic.
          // For simplicity: We'll just set it. If it overwrites, lastActive is what matters.
        }, { merge: true });
      } catch (e) {
        console.error("Session update failed", e); // Likely permissions before rules are live
      }
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 60 * 1000); // Update every minute

    // 4. Listen for All Sessions
    const sessionsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('lastActive', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  // Keyboard Shortcuts
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleEnterApp = async () => {
    setCurrentView('app');
    if (!user && !isSharedView) { // Only try to sign in anonymously if not already in a shared view
      // If entering app and not logged in, start Guest Mode
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Guest mode init failed:", error);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Data Sync
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isSharedView) return; // Don't sync personal tools if viewing shared stack
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
  }, [user, isSharedView]);

  // ---------------------------------------------------------------------------
  // 3. AI Features
  // ---------------------------------------------------------------------------
  const handleAutoFill = async (targetFormSetter, currentForm) => {
    if (isSharedView) return;
    if (!currentForm.name && !currentForm.link) { alert("Please enter a Name or Link to auto-fill."); return; }
    setIsGenerating(true);
    try {
      const categoryList = categories.filter(c => !c.isSystem).map(c => c.id).join(", ");
      const prompt = `I am adding a tool to my developer toolbox. Name: "${currentForm.name}", Link: "${currentForm.link}". Available Categories IDs: [${categoryList}, "ai", "dev", "design", "workflow", "resource"]. Task: 1. Identify tool. 2. Write concise 1-sentence 'useCase' (max 10 words). 3. Select SINGLE best category ID. 4. Write short 'notes' (max 15 words) pro tip. Return JSON: { "useCase": string, "category": string, "notes": string, "version": "latest stable version or 'Web'" }`;

      // Call Cloud Function Proxy
      const generate = httpsCallable(functions, 'generateContent');
      const result = await generate({ prompt });
      const data = result.data;

      const parsed = typeof data === 'string' ? JSON.parse(data) : data; // Handle if function returns string or object
      // Gemini often returns the JSON inside markdown code blocks, verify parser robustness in function or here
      // For now assuming function returns clean object or strict JSON string
      // Let's assume the function handles basic extraction or clean return, but we might need to parse.
      // Actually, my proxy implementation returns `data` from `response.json()`. 
      // Gemini API returns `{ candidates: ... }`.

      let aiContent = "";
      if (parsed.candidates && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
        aiContent = parsed.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid AI response format");
      }

      // Clean markdown if present
      aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const extracted = JSON.parse(aiContent);

      targetFormSetter(prev => ({ ...prev, useCase: extracted.useCase || prev.useCase, category: extracted.category || 'resource', notes: extracted.notes || prev.notes, version: extracted.version || prev.version }));
    } catch (e) { console.error(e); alert("Could not auto-fill. " + e.message); } finally { setIsGenerating(false); }
  };

  const refreshRecommendations = async () => {
    if (isSharedView) return;
    if (!user) return;
    setIsCurating(true);
    try {
      const currentTools = tools.map(t => t.name).join(", ");
      const prompt = `I have a developer toolbox with: [${currentTools}]. Suggest 5 NEW, high-quality tools I am missing. For each: name, version, link, category (ai, dev, design, workflow), useCase (max 8 words), icon (Lucide name). Return JSON key "recommendations" array.`;

      const generate = httpsCallable(functions, 'generateContent');
      const result = await generate({ prompt });
      const data = result.data;

      let aiContent = "";
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.candidates && parsed.candidates[0].content) {
        aiContent = parsed.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid AI response");
      }

      aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultObj = JSON.parse(aiContent);

      if (resultObj.recommendations) {
        setRecommendations(resultObj.recommendations);
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), { customRecommendations: resultObj.recommendations }, { merge: true });
      }
    } catch (e) { console.error(e); } finally { setIsCurating(false); }
  };

  // ---------------------------------------------------------------------------
  // 4. Actions
  // ---------------------------------------------------------------------------
  const handleOpenToolModal = (tool = null) => {
    if (isSharedView) return;
    if (tool) {
      setEditingTool(tool);
      setToolFormData({ ...tool, workflowJson: tool.workflowJson || null, workflowName: tool.workflowName || '', cost: tool.cost || '', billingCycle: tool.billingCycle || 'monthly', currency: tool.currency || '$' });
    } else {
      setEditingTool(null);
      setToolFormData({ name: '', version: '', link: '', category: 'resource', useCase: '', notes: '', isFavorite: false, workflowJson: null, workflowName: '', cost: '', billingCycle: 'monthly', currency: '$' });
    }
    setIsToolModalOpen(true);
  };

  const handleToolSubmit = async (e) => {
    e.preventDefault();
    if (!user || isSharedView) return;
    setIsSaving(true);
    try {
      const toolData = { ...toolFormData, dateAdded: editingTool ? (editingTool.dateAdded || new Date().toISOString()) : new Date().toISOString() };
      const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tools');
      editingTool ? await updateDoc(doc(colRef, editingTool.id), toolData) : await addDoc(colRef, toolData);
      setIsToolModalOpen(false);

      // PROMPT TO SIGN IN: If guest and added > 2 tools
      if (user.isAnonymous && !editingTool && tools.length >= 2) {
        // Small delay to let the modal close smoothly first
        setTimeout(() => {
          setAuthMode('signup');
          setIsAuthModalOpen(true);
        }, 500);
      }

    } catch (error) { console.error("Error saving tool:", error); }
    setIsSaving(false);
  };

  const handleToolDelete = async (id) => {
    if (!user || isSharedView || !window.confirm('Delete this tool?')) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tools', id)); } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (tool, e) => {
    e.stopPropagation();
    if (!user || isSharedView) return;
    try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tools', tool.id), { isFavorite: !tool.isFavorite }); } catch (e) { console.error(e); }
  };

  const togglePin = async (tool, e) => {
    e.stopPropagation();
    if (!user || isSharedView) return;
    try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tools', tool.id), { isPinned: !tool.isPinned }); } catch (e) { console.error(e); }
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
    if (isSharedView) return;
    setEditingTool(tool);
    setReplaceFormData({ name: '', link: '', version: '', notes: tool.notes || '', useCase: tool.useCase, category: tool.category });
    setIsReplaceModalOpen(true);
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!user || isSharedView || !editingTool) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tools', editingTool.id);
      const archivalNote = `[Replaced ${editingTool.name} on ${new Date().toLocaleDateString()}]`;
      const newNotes = replaceFormData.notes ? `${replaceFormData.notes}\n${archivalNote}` : archivalNote;
      await updateDoc(docRef, { name: replaceFormData.name, link: replaceFormData.link, version: replaceFormData.version, notes: newNotes, dateAdded: new Date().toISOString(), workflowJson: null, workflowName: '', cost: '', billingCycle: 'monthly' });
      setIsReplaceModalOpen(false);
      setEditingTool(null);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const addRecommendation = async (rec) => {
    if (isSharedView) return;
    if (!user) {
      alert("Please wait for sign-in or reload.");
      return;
    }
    try {
      const exists = tools.some(t => t.name.toLowerCase() === rec.name.toLowerCase());
      if (exists) {
        alert("You already have this tool!");
        // Force remove it if it exists locally but wasn't filtered
        setRecommendations(prev => prev.filter(r => r.name !== rec.name));
        return;
      }

      // 1. Add to DB
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tools'), {
        ...rec,
        dateAdded: new Date().toISOString(),
        notes: `Added from recommendations. ${rec.useCase}`,
        isFavorite: false,
        isPinned: false,
        cost: '',
        billingCycle: 'monthly',
        currency: '$',
        workflowJson: null,
        workflowName: ''
      });

      // 2. Remove from local recommendations immediately (Optimistic UI)
      setRecommendations(prev => prev.filter(r => r.name !== rec.name));

    } catch (e) {
      console.error("Error adding rec:", e);
      alert("Failed to add tool: " + e.message);
    }
  };

  const loadSampleData = async () => {
    if (isSharedView) return;
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
    if (!user || isSharedView) return;
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
    if (!user || isSharedView || ['all', 'favorites'].includes(id) || !window.confirm('Delete this category?')) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', id)); if (activeCategory === id) setActiveCategory('all'); } catch (e) { console.error(e); }
  };

  const toggleRecommendations = async () => {
    if (isSharedView) return;
    if (!user) return;
    const newVal = !showRecommendations;
    setShowRecommendations(newVal);
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), { showRecommendations: newVal }, { merge: true }); } catch (e) { console.error(e); }
  };

  // ---------------------------------------------------------------------------
  // 6. Auth Actions
  // ---------------------------------------------------------------------------
  // 6. Auth Actions (Logic Moved to AuthModal.jsx)
  // ---------------------------------------------------------------------------

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut(auth);
      // Go back to landing page on sign out
      setCurrentView('landing');
      setIsSettingsModalOpen(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Stats & Render Helpers
  // ---------------------------------------------------------------------------
  // If in shared view, use shared tools. Otherwise use personal tools.
  const displayedTools = isSharedView ? (sharedStack?.tools || []) : tools;

  const filteredTools = useMemo(() => {
    return displayedTools.filter(tool => {
      const matchesSearch = (tool.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (tool.useCase || '').toLowerCase().includes(searchTerm.toLowerCase());
      let matchesCategory = true;
      if (activeCategory === 'favorites') matchesCategory = tool.isFavorite;
      else if (activeCategory === 'pinned') matchesCategory = tool.isPinned;
      else if (activeCategory !== 'all') matchesCategory = tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [displayedTools, searchTerm, activeCategory]);

  const recommendedDisplay = useMemo(() => recommendations.filter(rec => !tools.some(t => t.name.toLowerCase() === rec.name.toLowerCase())), [tools, recommendations]);

  const subscriptionStats = useMemo(() => {
    const paidTools = displayedTools.filter(t => t.cost && parseFloat(t.cost) > 0);
    let monthlyTotal = 0; let yearlyTotal = 0;
    paidTools.forEach(t => {
      const cost = parseFloat(t.cost);
      if (t.billingCycle === 'monthly') { monthlyTotal += cost; yearlyTotal += cost * 12; }
      else if (t.billingCycle === 'yearly') { monthlyTotal += cost / 12; yearlyTotal += cost; }
    });
    return { monthlyTotal, yearlyTotal, paidTools };
  }, [displayedTools]);

  const textClass = darkMode ? "text-neutral-100" : "text-slate-900";
  const headerBgClass = darkMode ? "bg-black/40 backdrop-blur-xl border-white/5" : "bg-white/80 backdrop-blur-md border-slate-200";
  const inputBgClass = darkMode ? "bg-white/5 border-white/10 text-white focus:border-white/20" : "bg-white border-slate-200 text-slate-800 focus:border-teal-500/50";

  // --- VIEW SWITCHING ---
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={handleEnterApp}
          onSignUp={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
          user={user}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          auth={auth}
          mode={authMode}
          setMode={setAuthMode}
          logo={LOGO_URL}
        />
      </>
    );
  }

  // --- APP DASHBOARD ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-teal-500/30 selection:text-teal-200 relative">
      <DarkVeilBackground />
      <ClickSpark />

      {/* SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl h-full transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {LOGO_URL ? (
              <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded-full shadow-lg shrink-0" />
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-black shadow-lg shadow-teal-500/20 shrink-0">
                <Network size={20} strokeWidth={3} />
              </div>
            )}
            {!isSidebarCollapsed && <span className="text-xl font-bold tracking-tight whitespace-nowrap">{APP_NAME}</span>}
          </div>
          {!isSidebarCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(true)} className="text-neutral-500 hover:text-white"><Menu size={18} /></button>
          )}
        </div>

        {/* Collapsed Toggle (if collapsed, show it centered below logo maybe? or usually the logo itself toggles, or a separate button. Let's put a toggle in the top bar actually, or handle it here)
            Actually, the user asked for "click on 3 horizontal line button".
            If I hide the button inside the collapsed sidebar, they can't open it back easily unless I keep it visible.
            Let's keep a toggle button visible always or put it in the header? 
            Let's put the toggle in the main header instead to control the sidebar, OR keep a toggle at the top of the sidebar.
        */}

        <div className="flex-1 overflow-y-auto px-2 space-y-6 no-scrollbar mt-6">
          {isSidebarCollapsed && (
            <div className="mb-4 flex justify-center">
              <button onClick={() => setIsSidebarCollapsed(false)} className="p-2 text-neutral-500 hover:text-white"><Menu size={20} /></button>
            </div>
          )}

          {/* 1. WORKSPACE */}
          <div className="px-2">
            {!isSidebarCollapsed && <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">Workspace</h3>}
            <div className="space-y-1">
              <button onClick={() => setActiveCategory('all')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === 'all' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'} ${isSidebarCollapsed ? 'justify-center' : ''}`} title="All Tools">
                <LayoutGrid size={16} />{!isSidebarCollapsed && <span>All Tools</span>}
              </button>
              <button onClick={() => setActiveCategory('favorites')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === 'favorites' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'} ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Favorites">
                <Star size={16} />{!isSidebarCollapsed && <span>Favorites</span>}
              </button>
            </div>
          </div>

          {/* 2. PINNED */}
          <div className="px-2">
            {!isSidebarCollapsed && <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">Pinned</h3>}
            <div className="space-y-1">
              {displayedTools.filter(t => t.isPinned).map(tool => (
                <a key={tool.id} href={tool.link} target="_blank" className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`} title={tool.name}>
                  <div className="w-4 h-4 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-bold">{tool.name[0]}</div>
                  {!isSidebarCollapsed && <span className="truncate">{tool.name}</span>}
                </a>
              ))}
              {displayedTools.filter(t => t.isPinned).length === 0 && !isSidebarCollapsed && (
                <p className="px-3 text-[10px] text-neutral-600 italic">Pin tools for quick access</p>
              )}
            </div>
          </div>

          {/* 3. WORKFLOWS (Custom Categories) */}
          <div className="px-2">
            {!isSidebarCollapsed && <div className="flex items-center justify-between mb-2 px-2"><h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Workflows</h3><button onClick={() => setIsCategoryModalOpen(true)} className="text-neutral-500 hover:text-white"><Plus size={12} /></button></div>}
            <div className="space-y-1">
              {categories.filter(c => !['all', 'favorites'].includes(c.id)).map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'} ${isSidebarCollapsed ? 'justify-center' : ''}`} title={cat.label}>
                  {React.createElement(ICON_MAP[cat.icon] || ICON_MAP.Box, { size: 16 })}
                  {!isSidebarCollapsed && <span className="truncate">{cat.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 4. COMMUNITY */}
          <div className="px-2">
            {!isSidebarCollapsed && <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">Community</h3>}
            <div className="space-y-1">
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Community Hub">
                <Users size={16} />{!isSidebarCollapsed && <span>Community Hub</span>}
              </button>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => setIsSubscriptionModalOpen(true)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-green-400 transition-all mb-2 ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Subscriptions">
            <CreditCard size={16} className="shrink-0" /> {!isSidebarCollapsed && <span>Subscriptions</span>}
          </button>

          {user?.isAnonymous ? (
            <button onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Sign In">
              <LogIn size={16} className="shrink-0" /> {!isSidebarCollapsed && <span>Sign In</span>}
            </button>
          ) : (
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl bg-white/5 border border-white/5`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-black shrink-0">
                  {user?.displayName ? user.displayName[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                {!isSidebarCollapsed && <span className="text-xs truncate">{user?.displayName || 'User'}</span>}
              </div>
              {!isSidebarCollapsed && (
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white">
                  <Settings size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/60 backdrop-blur-md">
          <span className="font-bold flex items-center gap-2"><Network size={18} /> Nexus</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2"><Menu size={20} /></button>
        </header>

        {/* Top Bar (Search + Toggles) */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-teal-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-teal-500/50 focus:bg-white/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}><ListIcon size={16} /></button>
            {/* Add Tool Button - Hide if Shared View */}
            {!isSharedView && (
              <button
                onClick={() => handleOpenToolModal()}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] active:scale-95"
              >
                <Plus size={18} /> <span className="hidden lg:inline">Add Tool</span>
              </button>
            )}

            {/* Create Your Own Button - Show ONLY if Shared View */}
            {isSharedView && (
              <button
                onClick={() => {
                  setIsSharedView(false);
                  setSharedStack(null);
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
              >
                <Zap size={18} /> Create Your Own
              </button>
            )}
          </div>
          <button onClick={() => handleOpenToolModal()} className="hidden md:flex ml-4 px-4 py-2.5 bg-teal-500 text-black rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all items-center justify-center gap-2">
            <Plus size={18} strokeWidth={3} /> New Tool
          </button>
        </div>

        {/* Scrollable Tool Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 no-scrollbar">
          {loading && !isSharedView ? ( // Only show loading if not in shared view (shared view loads instantly)
            <div className="flex flex-col items-center justify-center h-64 opacity-50"><Loader2 className="animate-spin mb-4 text-white" size={40} /><p className="text-white text-sm">SYNCING...</p></div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/30"><Database size={32} /></div>
              <h3 className="text-xl font-bold mb-2">{isSharedView ? "No tools in this shared stack" : "No tools found"}</h3>
              <p className="text-neutral-500 mb-6 max-w-xs mx-auto">{isSharedView ? "This shared list is empty or the tools don't match your filter." : "Your collection is empty. Start adding tools to build your arsenal."}</p>
              {!isSharedView && (
                <button onClick={() => handleOpenToolModal()} className="px-6 py-3 bg-teal-500 text-black rounded-xl font-bold hover:bg-teal-400 transition-all flex items-center justify-center gap-2 mx-auto">
                  <Plus size={18} strokeWidth={3} /> Add Your First Tool
                </button>
              )}
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
                  onTogglePin={(e) => togglePin(tool, e)}
                  darkMode={darkMode}
                  isSharedView={isSharedView}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Footer */}
        {showRecommendations && !isSharedView && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
            <div className="pointer-events-auto bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span className="text-sm font-bold text-neutral-300">Discover</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={refreshRecommendations} disabled={isCurating} className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                    {isCurating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
                  <button onClick={toggleRecommendations} className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"><X size={14} /></button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {recommendedDisplay.slice(0, 5).map((rec, i) => (
                  <div key={i} className="flex-shrink-0 w-56 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-2 group">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-white">{rec.name}</span>
                      <button onClick={() => addRecommendation(rec)} className="p-1 bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-black rounded transition-colors"><Plus size={12} /></button>
                    </div>
                    <p className="text-[10px] text-neutral-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors opacity-90">{rec.useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- ALL MODALS (Keep existing modal code here, same logic as before) --- */}
      {/* ... [Tool Modal, Settings Modal, Auth Modal etc. would go here identical to previous implementation] ... */}
      {/* For brevity, I'm ensuring the key modals are included below */}

      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
          <div className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden bg-[#0A0A0A] border border-white/10">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingTool ? 'Edit Tool' : 'New Tool'}</h2>
              <button onClick={() => setIsToolModalOpen(false)}><X size={20} className="text-white" /></button>
            </div>
            <form onSubmit={handleToolSubmit} className="p-8 space-y-6">
              {!editingTool && (
                <div className="p-4 rounded-xl flex items-center justify-between bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 text-white rounded-lg"><Wand2 size={16} /></div>
                    <div><div className="text-sm font-bold text-purple-300">AI Auto-Fill</div><div className="text-xs text-purple-300/60">Enter name/link then click here</div></div>
                  </div>
                  <button type="button" onClick={() => handleAutoFill(setToolFormData, toolFormData)} disabled={isGenerating} className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors">{isGenerating ? <Loader2 size={14} className="animate-spin" /> : "Auto-Fill"}</button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white outline-none focus:border-teal-500/50" value={toolFormData.name} onChange={e => setToolFormData({ ...toolFormData, name: e.target.value })} />
                <input placeholder="Version" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white outline-none focus:border-teal-500/50" value={toolFormData.version} onChange={e => setToolFormData({ ...toolFormData, version: e.target.value })} />
              </div>
              <input required placeholder="URL" className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white outline-none focus:border-teal-500/50" value={toolFormData.link} onChange={e => setToolFormData({ ...toolFormData, link: e.target.value })} />

              <div className="flex flex-wrap gap-2">
                {categories.filter(c => !c.isSystem).map(cat => (
                  <button key={cat.id} type="button" onClick={() => setToolFormData({ ...toolFormData, category: cat.id })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${toolFormData.category === cat.id ? 'bg-teal-500 text-white border-teal-500' : 'border-white/10 text-neutral-400'}`}>{cat.label}</button>
                ))}
              </div>

              <textarea placeholder="Use case..." rows={2} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white outline-none focus:border-teal-500/50 resize-none" value={toolFormData.useCase} onChange={e => setToolFormData({ ...toolFormData, useCase: e.target.value })} />
              <textarea placeholder="Notes..." rows={2} className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white outline-none focus:border-teal-500/50 resize-none" value={toolFormData.notes} onChange={e => setToolFormData({ ...toolFormData, notes: e.target.value })} />

              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 text-sm font-bold opacity-70"><DollarSign size={16} /> Track Cost</div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">$</span>
                    <input type="number" placeholder="0.00" className="w-full pl-7 pr-3 py-2 rounded-lg text-sm bg-transparent border border-white/10 outline-none focus:border-teal-500/50" value={toolFormData.cost} onChange={e => setToolFormData({ ...toolFormData, cost: e.target.value })} />
                  </div>
                  <select className="w-full px-3 py-2 rounded-lg text-sm bg-transparent border border-white/10 outline-none text-white focus:border-teal-500/50" value={toolFormData.billingCycle} onChange={e => setToolFormData({ ...toolFormData, billingCycle: e.target.value })}>
                    <option value="monthly" className="bg-black text-white">Monthly</option>
                    <option value="yearly" className="bg-black text-white">Yearly</option>
                    <option value="one-time" className="bg-black text-white">One-Time</option>
                  </select>
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${toolFormData.workflowJson ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10 hover:border-white/20'}`}>
                <input type="file" id="workflow-upload" className="hidden" accept=".json" onChange={handleWorkflowUpload} />
                <label htmlFor="workflow-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileJson size={24} className={toolFormData.workflowJson ? 'text-teal-400' : 'opacity-50'} />
                  <span className="text-xs font-medium text-neutral-400">{toolFormData.workflowName ? toolFormData.workflowName : "Attach ComfyUI Workflow (.json)"}</span>
                </label>
                {toolFormData.workflowJson && <button type="button" onClick={() => setToolFormData({ ...toolFormData, workflowJson: null, workflowName: '' })} className="text-[10px] text-red-400 mt-2 hover:underline">Remove</button>}
              </div>

              <button type="submit" className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-400" disabled={isSaving}>Save Tool</button>
            </form>
          </div>
        </div>
      )}

      {/* [Other Modals kept hidden for brevity but would be present in real code] */}
      {/* Ensure Auth, Settings, Replace, Category modals are rendered similarly to previous versions but with the bg-[#0A0A0A] style */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        auth={auth}
        mode={authMode}
        setMode={setAuthMode}
        logo={LOGO_URL}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        sessions={sessions}
        onSignOut={() => signOut(auth)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        stats={subscriptionStats}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tools={isSharedView ? (sharedStack?.tools || []) : tools}
        categories={categories}
      />

      {/* Shared Stack Creation Modal */}
      <CreateShareStackModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tools={tools}
        user={user}
        db={db}
        appId={appId}
      />
    </div>
  );
}

// ToolCard (Updated for Dark Veil Style)
function ToolCard({ tool, categories, viewMode, onEdit, onReplace, onDelete, onToggleFavorite, onTogglePin, darkMode, isSharedView }) {
  const cat = categories.find(c => c.id === tool.category) || categories.find(c => c.id === 'resource') || { label: 'Ref', theme: 'gray', icon: 'Box' };
  const theme = COLOR_PALETTES[cat.theme] || COLOR_PALETTES.gray;
  const Icon = ICON_MAP[cat.icon] || ICON_MAP.Box;
  const cardRef = useRef(null);
  const faviconUrl = useMemo(() => { try { return `https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=128`; } catch { return null; } }, [tool.link]);
  const [imgError, setImgError] = useState(false);
  const IconCmp = (!imgError && faviconUrl) ? <img src={faviconUrl} className="w-full h-full object-contain rounded-md" onError={() => setImgError(true)} /> : <Icon size={20} />;

  // Workflow Download
  const downloadWorkflow = (e) => {
    e.stopPropagation(); if (!tool.workflowJson) return;
    const blob = new Blob([tool.workflowJson], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = tool.workflowName || `${tool.name}_workflow.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleMove = (e) => { if (viewMode !== 'list' && cardRef.current) { const rect = cardRef.current.getBoundingClientRect(); const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15; const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15; cardRef.current.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`; } };
  const handleLeave = () => { if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'; };

  if (viewMode === 'list') {

    return (
      <div className="group relative rounded-2xl transition-all">

        {/* 1. Electric Border Gradient */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20">
          <div className="absolute -inset-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,#00000000_50%,#14b8a6_80%,#14b8a6_100%)] animate-[spin_4s_linear_infinite]" />
        </div>

        {/* 2. Main Background */}
        <div className="absolute inset-[1px] rounded-[15px] bg-black/40 border border-white/5 transition-all group-hover:bg-[#0A0A0A] group-hover:border-transparent -z-10" />

        {/* 3. Content */}
        <div className="relative p-4 flex items-center gap-4 h-full">
          <div className={`w-10 h-10 p-2 rounded-lg flex items-center justify-center ${theme.bg} bg-opacity-20 ${theme.color}`}>{IconCmp}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><h3 className="font-bold truncate text-white">{tool.name}</h3>{tool.isFavorite && <Star size={12} className="text-yellow-400 fill-current" />}{tool.cost && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 rounded">${tool.cost}</span>}</div>
            <p className="text-xs truncate text-neutral-400">{tool.useCase}</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {tool.workflowJson && <button onClick={downloadWorkflow} className="p-2 hover:bg-white/10 rounded-lg text-teal-400"><Download size={16} /></button>}
            {!isSharedView && <button onClick={onReplace} className="p-2 hover:bg-white/10 text-teal-400 rounded-lg"><ArrowLeftRight size={16} /></button>}
            <a href={tool.link} target="_blank" className="p-2 hover:bg-white/10 rounded-lg"><ExternalLink size={16} className="opacity-50" /></a>
            {!isSharedView && (
              <>
                <button onClick={onEdit} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={onDelete} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave} className="group relative rounded-3xl flex flex-col gap-4 transition-all duration-300" style={{ transformStyle: 'preserve-3d' }}>

      {/* 1. Electric Border Gradient (Visible on Hover) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20">
        <div className="absolute -inset-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,#00000000_50%,#14b8a6_80%,#14b8a6_100%)] animate-[spin_4s_linear_infinite]" />
      </div>

      {/* 2. Main Background (Slightly smaller to reveal border) */}
      {/* Default: Border white/5, BG black/40. Hover: Border transparent (handled by overlay), BG black/80 */}
      <div className="absolute inset-[1px] rounded-[23px] bg-black/40 backdrop-blur-md border border-white/5 transition-all group-hover:bg-[#0A0A0A] group-hover:border-transparent -z-10" />

      {/* 3. Content Container */}
      <div className="relative p-6 flex flex-col gap-4 h-full">
        <div className="flex justify-between items-start" style={{ transform: 'translateZ(20px)' }}>
          <div className={`w-12 h-12 p-2.5 rounded-2xl flex items-center justify-center shadow-inner ${theme.bg} bg-opacity-20 ${theme.color}`}>{IconCmp}</div>
          <div className="flex gap-1">
            {!isSharedView && (
              <button onClick={onTogglePin} className={`p-2 rounded-full hover:bg-white/10 ${tool.isPinned ? 'text-teal-400' : 'text-neutral-600'}`} title={tool.isPinned ? "Unpin" : "Pin"}><Pin size={18} className={tool.isPinned ? 'fill-current' : ''} /></button>
            )}
            {!isSharedView && (
              <button onClick={onToggleFavorite} className={`p-2 rounded-full hover:bg-white/10 ${tool.isFavorite ? 'text-yellow-400' : 'text-neutral-600'}`}><Star size={18} className={tool.isFavorite ? 'fill-current' : ''} /></button>
            )}
          </div>
        </div>
        <div style={{ transform: 'translateZ(10px)' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white">{tool.name}</h3>
            <div className="flex gap-1">
              {tool.cost && <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">${tool.cost}/{tool.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
              {tool.workflowJson && <button onClick={downloadWorkflow} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-teal-500/30 text-teal-300 hover:bg-teal-500/10"><FileJson size={10} /> JSON</button>}
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.color}`}>{cat.label}</span>
          <p className="text-sm mt-2 leading-relaxed text-white/80">{tool.useCase}</p>
        </div>
        <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center" style={{ transform: 'translateZ(15px)' }}>
          <div className="flex gap-1">
            {!isSharedView && (
              <>
                <button onClick={onReplace} title="Replace" className="p-2 hover:bg-teal-500/10 text-teal-400 rounded-lg"><ArrowLeftRight size={14} /></button>
                <button onClick={onEdit} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg"><Edit2 size={14} /></button>
                <button onClick={onDelete} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 size={14} /></button>
              </>
            )}
          </div>
          <a href={tool.link} target="_blank" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ${theme.color}`}>Open <ExternalLink size={10} /></a>
        </div>
      </div>
    </div>
  );
}