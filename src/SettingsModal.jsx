import { Settings, X, LogOut, Smartphone, Monitor } from 'lucide-react';

// Settings Modal Component
export default function SettingsModal({ isOpen, onClose, user, sessions, onSignOut }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-neutral-400" size={20} /> Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Account Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Account</label>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white truncate">{user?.email}</div>
                                <div className="text-xs text-neutral-400">Synced via Google Firestore</div>
                            </div>
                        </div>
                        <button onClick={onSignOut} className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 font-medium hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>

                    {/* Devices Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Devices</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {sessions.map((session) => {
                                const isCurrent = session.id === localStorage.getItem('nexus_device_id');
                                return (
                                    <div key={session.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isCurrent ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                        <div className={`p-2 rounded-lg ${isCurrent ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-neutral-400'}`}>
                                            {session.userAgent?.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Monitor size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white flex items-center gap-2">
                                                {session.deviceName || 'Unknown Device'}
                                                {isCurrent && <span className="text-[10px] bg-teal-500 text-black font-bold px-1.5 py-0.5 rounded">YOU</span>}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {session.lastActive?.seconds ? new Date(session.lastActive.seconds * 1000).toLocaleDateString() : 'Just now'}
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
