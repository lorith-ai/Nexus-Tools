import React from 'react';
import { X, CreditCard, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, stats }) {
    if (!isOpen) return null;

    const { monthlyTotal, yearlyTotal, paidTools } = stats;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="text-teal-400" size={20} /> Subscriptions
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
                            <div className="flex items-center gap-2 text-teal-400 mb-2">
                                <Calendar size={16} /> <span className="text-xs font-bold uppercase">Monthly</span>
                            </div>
                            <div className="text-2xl font-bold text-white">${monthlyTotal.toFixed(2)}</div>
                            <div className="text-xs text-neutral-500">Estimated cost</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-purple-400 mb-2">
                                <TrendingUp size={16} /> <span className="text-xs font-bold uppercase">Yearly</span>
                            </div>
                            <div className="text-2xl font-bold text-white">${yearlyTotal.toFixed(2)}</div>
                            <div className="text-xs text-neutral-500">Projected cost</div>
                        </div>
                    </div>

                    {/* List */}
                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Active Subscriptions</h3>

                        {paidTools.length === 0 ? (
                            <div className="text-center py-8 rounded-xl bg-white/5 border border-dashed border-white/10">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                                    <DollarSign size={24} />
                                </div>
                                <p className="text-neutral-300 font-medium">No active subscriptions</p>
                                <p className="text-xs text-neutral-500 mt-1">Add a tool with a cost to see it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {paidTools.map(tool => (
                                    <div key={tool.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                                                {tool.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-white truncate">{tool.name}</div>
                                                <div className="text-[10px] text-neutral-500 capitalize">{tool.billingCycle}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm font-medium text-white">
                                            ${tool.cost}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total Badge */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                        <div className="flex items-center gap-2 text-sm font-bold"><AlertCircle size={16} /> Total Active Tools</div>
                        <div className="text-xl font-bold">{paidTools.length}</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
