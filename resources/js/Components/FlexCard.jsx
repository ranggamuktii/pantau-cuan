import { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, tier, activeStocks, isDarkMode = true }, ref) => {
    // Determine Bandar Tier based on the passed tier object from Dashboard
    let pangkat = tier?.name || "Kuli Pasar";
    let icon = tier?.icon || "🌱";
    let tierColor = tier?.name === 'Anak Sultan' ? 'text-purple-500' :
                    tier?.name === 'Bandar Cilik' ? 'text-blue-500' :
                    tier?.name === 'Juragan ARA' ? 'text-emerald-500' :
                    tier?.name === 'Pedagang Asongan' ? 'text-amber-500' :
                    'text-zinc-500';
    let badgeBg = tier?.name === 'Anak Sultan' ? 'bg-purple-50' :
                  tier?.name === 'Bandar Cilik' ? 'bg-blue-50' :
                  tier?.name === 'Juragan ARA' ? 'bg-emerald-50' :
                  tier?.name === 'Pedagang Asongan' ? 'bg-amber-50' :
                  'bg-zinc-100';

    // Card Colors based on theme
    const bgClass = "bg-[#0A0A0A]";
    const textMain = "text-white";
    const textMuted = "text-zinc-400";
    const borderClass = "border-zinc-800";

    return (
        <div ref={ref} className={`w-[400px] min-h-[640px] relative overflow-hidden bg-[#030303] text-white rounded-[2.5rem] font-sans flex flex-col p-10 border border-zinc-800/80 shadow-2xl`} style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            
            {/* Premium Background Gradients & Lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            
            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Header */}
            <div className="relative z-10 flex justify-center items-center mb-10">
                <div className="flex items-center space-x-2">
                    <img src="/pantau-cuan-logo.svg" alt="Logo" className="h-6 opacity-90" />
                    <span className="font-black text-sm tracking-[0.2em] uppercase opacity-80">Pantau Cuan</span>
                </div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-6">
                <p className={`text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-[0.2em] flex items-center`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    Portofolio Tracker
                </p>
                
                <div className="flex flex-col items-start">
                    <span className="text-4xl font-black tracking-tighter leading-none mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-sm">
                        Cuan Maksimal!
                    </span>
                    
                    <div className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        All Time High
                    </div>
                </div>
            </div>

            {/* Stocks & Footer */}
            <div className="relative z-10 mt-auto">
                {activeStocks && activeStocks.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center mb-4 text-zinc-400">
                            <svg className="w-4 h-4 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-xs font-bold uppercase tracking-[0.15em]">Koleksi IPO</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {activeStocks.slice(0, 8).map((stock, i) => {
                                const isProfit = stock.percentage > 0;
                                const isLoss = stock.percentage < 0;
                                return (
                                    <div key={i} className="flex flex-col justify-center px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-0 relative z-10">
                                            <div className="flex items-center space-x-2">
                                                {stock.logo && (
                                                    <img src={stock.logo} alt={stock.code} className="w-6 h-6 rounded-full border border-white/20 object-cover bg-white" />
                                                )}
                                                <span className="text-base font-black text-white">{stock.code}</span>
                                            </div>
                                            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${isProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : isLoss ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'} font-black text-xs`}>
                                                {isProfit && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                                {isLoss && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
                                                <span>
                                                    {isProfit ? '+' : ''}{stock.percentage % 1 === 0 ? stock.percentage : stock.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* Subtle background glow for profit/loss */}
                                        {isProfit && <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 blur-[10px] rounded-full translate-x-4 -translate-y-4"></div>}
                                        {isLoss && <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 blur-[10px] rounded-full translate-x-4 -translate-y-4"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div className={`flex items-center justify-between pt-6 border-t border-white/10`}>
                    <div className="flex items-center space-x-4">
                        <img 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'I')}&background=18181b&color=fff&size=128&bold=true`} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg object-cover" 
                        />
                        <div>
                            <p className="text-base font-black leading-none text-white tracking-wide">{user?.name || 'Investor'}</p>
                            <p className="text-[11px] font-semibold text-zinc-400 mt-1.5 uppercase tracking-widest">pantaucuan.site</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;
