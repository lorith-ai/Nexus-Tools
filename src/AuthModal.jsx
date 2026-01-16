import React, { useState } from 'react';
import { X, Mail, Github, CheckSquare, Network, Lock, User, ArrowRight } from 'lucide-react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup
} from "firebase/auth";

export default function AuthModal({ isOpen, onClose, auth, mode, setMode, logo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'signup') {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (name) await updateProfile(cred.user, { displayName: name });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    const handleSocialLogin = async (providerName) => {
        setError('');
        const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row min-h-[600px]">
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                    <X size={20} />
                </button>

                {/* LEFT COLUMN: Art & Visuals */}
                <div className="hidden md:flex flex-1 relative bg-[#050505] items-center justify-center overflow-hidden">
                    {/* Abstract Gradient Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-[#050505] to-[#050505] z-0"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-teal-500/10 to-transparent z-0"></div>

                    {/* Floating Visual Elements */}
                    <div className="relative z-10 p-12 flex flex-col h-full justify-between">
                        <div>
                            {logo ? (
                                <img src={logo} alt="Nexus Logo" className="w-16 h-16 rounded-2xl mb-6 shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)] object-cover bg-black" />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-black mb-6 shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)]">
                                    <Network size={24} strokeWidth={3} />
                                </div>
                            )}
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Master Your<br />Digital Arsenal.</h1>
                            <p className="text-neutral-400 text-lg leading-relaxed">Organize, track, and scale your developer tool stack with AI-powered intelligence.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                <CheckSquare className="text-teal-400" size={20} /> <span>Sync across all devices</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                <CheckSquare className="text-teal-400" size={20} /> <span>Track subscription costs</span>
                            </div>
                        </div>
                    </div>

                    {/* Mesh Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-repeat z-[5] pointer-events-none mix-blend-overlay"></div>
                </div>

                {/* RIGHT COLUMN: Form */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-[#0A0A0A]">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{mode === 'signup' ? 'Create an account' : 'Welcome back'}</h2>
                        <p className="text-neutral-400">
                            {mode === 'signup' ? 'Start building your perfect workflow today.' : 'Enter your details to access your workspace.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {mode === 'signup' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-teal-500/50 focus:bg-white/10 focus:ring-1 focus:ring-teal-500/50 outline-none transition-all"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-teal-500/50 focus:bg-white/10 focus:ring-1 focus:ring-teal-500/50 outline-none transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-teal-500/50 focus:bg-white/10 focus:ring-1 focus:ring-teal-500/50 outline-none transition-all"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><X size={14} /> {error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-500 text-black rounded-xl font-bold text-lg hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0A0A] px-2 text-neutral-500">Or register with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="p-3 rounded-xl border border-white/10 hover:bg-white/5 text-white flex justify-center items-center gap-2 font-medium transition-all"
                        >
                            <Mail size={18} /> Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('github')}
                            className="p-3 rounded-xl border border-white/10 hover:bg-white/5 text-white flex justify-center items-center gap-2 font-medium transition-all"
                        >
                            <Github size={18} /> Github
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-neutral-400">
                        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            className="text-teal-400 hover:text-teal-300 font-bold hover:underline"
                            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        >
                            {mode === 'signin' ? "Sign up" : "Log in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
