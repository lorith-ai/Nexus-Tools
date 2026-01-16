import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Link as LinkIcon, Share2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateShareStackModal({ isOpen, onClose, tools, user, db, appId }) {
    const [title, setTitle] = useState('');
    const [selectedToolIds, setSelectedToolIds] = useState(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [copied, setCopied] = useState(false);

    // Initialize selected tools when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(`${user?.displayName || 'My'} Tool Stack`);
            // Default to selecting all favorite tools, or all if none favorite
            const favorites = tools.filter(t => t.isFavorite).map(t => t.id);
            if (favorites.length > 0) {
                setSelectedToolIds(new Set(favorites));
            } else {
                setSelectedToolIds(new Set(tools.map(t => t.id)));
            }
            setGeneratedLink(null);
            setCopied(false);
        }
    }, [isOpen, tools, user]);

    const toggleTool = (id) => {
        const newSet = new Set(selectedToolIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedToolIds(newSet);
    };

    const handleGenerateLink = async () => {
        if (!user || selectedToolIds.size === 0) return;
        setIsGenerating(true);

        try {
            const selectedTools = tools.filter(t => selectedToolIds.has(t.id));

            const payload = {
                title: title || 'Shared Stack',
                tools: selectedTools,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous',
                createdAt: serverTimestamp(),
                toolCount: selectedTools.length
            };

            const docRef = await addDoc(collection(db, 'artifacts', appId, 'shared_stacks'), payload);

            const url = `${window.location.origin}?share=${docRef.id}`;
            setGeneratedLink(url);
        } catch (error) {
            console.error("Error generating shared stack:", error);
            alert("Failed to generate link. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Share2 size={20} className="text-teal-400" />
                        Share Your Stack
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!generatedLink ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                    Stack Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-teal-500/5 transition-all"
                                    placeholder="e.g. My Ultimate Dev Setup"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        Select Tools ({selectedToolIds.size})
                                    </label>
                                    <button
                                        onClick={() => setSelectedToolIds(selectedToolIds.size === tools.length ? new Set() : new Set(tools.map(t => t.id)))}
                                        className="text-xs text-teal-400 hover:text-teal-300"
                                    >
                                        {selectedToolIds.size === tools.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>

                                <div className="space-y-2 border border-white/10 rounded-xl p-2 bg-black/20 max-h-[300px] overflow-y-auto">
                                    {tools.length === 0 ? (
                                        <p className="text-center text-neutral-500 py-4 text-sm">No tools to share.</p>
                                    ) : (
                                        tools.map(tool => (
                                            <div
                                                key={tool.id}
                                                onClick={() => toggleTool(tool.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedToolIds.has(tool.id)
                                                        ? 'bg-teal-500/10 border-teal-500/30'
                                                        : 'bg-transparent border-transparent hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedToolIds.has(tool.id)
                                                        ? 'bg-teal-500 border-teal-500'
                                                        : 'border-white/20 bg-white/5'
                                                    }`}>
                                                    {selectedToolIds.has(tool.id) && <Check size={12} className="text-black stroke-[3]" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${selectedToolIds.has(tool.id) ? 'text-white' : 'text-neutral-400'}`}>
                                                        {tool.name}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 truncate">{tool.category}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-6 ring-4 ring-teal-500/10">
                                <LinkIcon size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to Share!</h3>
                            <p className="text-neutral-400 mb-8 max-w-xs">Your stack snapshot has been created. Anyone with the link can view it.</p>

                            <div className="w-full flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl mb-4">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedLink}
                                    className="flex-1 bg-transparent border-none text-white text-sm px-2 focus:outline-none"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!generatedLink && (
                    <div className="p-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleGenerateLink}
                            disabled={isGenerating || selectedToolIds.size === 0}
                            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Link'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
