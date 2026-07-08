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

    const totalProfit = activeStocks?.reduce((acc, stock) => acc + (stock.profit || 0), 0) || 0;

    // Dynamic styles based on totalProfit
    let statusConfig = {
        title: "Cuan Maksimal!",
        titleGradient: "from-emerald-300 via-teal-200 to-emerald-400",
        badgeText: "All Time High",
        badgeBg: "bg-emerald-500/10 border-emerald-500/20",
        badgeTextClass: "text-emerald-400",
        badgeIcon: <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        glow1: "from-emerald-950/40 via-[#030303] to-teal-950/40",
        glow2: "from-emerald-500/40",
        glow3: "from-teal-500/40",
        pulsePoint: "bg-emerald-500"
    };

    if (totalProfit < 0) {
        statusConfig = {
            title: "Sabar Bosku!",
            titleGradient: "from-rose-300 via-red-200 to-rose-400",
            badgeText: "Sedang Berdarah",
            badgeBg: "bg-rose-500/10 border-rose-500/20",
            badgeTextClass: "text-rose-400",
            badgeIcon: <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>,
            glow1: "from-rose-950/40 via-[#030303] to-red-950/40",
            glow2: "from-rose-500/40",
            glow3: "from-red-500/40",
            pulsePoint: "bg-rose-500"
        };
    } else if (totalProfit === 0 && activeStocks?.length === 0) {
        statusConfig = {
            title: "Mulai Investasi!",
            titleGradient: "from-blue-300 via-indigo-200 to-blue-400",
            badgeText: "Siap Cuan",
            badgeBg: "bg-blue-500/10 border-blue-500/20",
            badgeTextClass: "text-blue-400",
            badgeIcon: <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
            glow1: "from-blue-950/40 via-[#030303] to-indigo-950/40",
            glow2: "from-blue-500/40",
            glow3: "from-indigo-500/40",
            pulsePoint: "bg-blue-500"
        };
    }

    return (
        <div ref={ref} className={`w-[400px] min-h-[640px] relative overflow-hidden bg-[#030303] text-white rounded-[2.5rem] font-sans flex flex-col p-10 border border-zinc-800/80 shadow-2xl`} style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* Studio Lighting & Gaussian Blurs */}
            <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.glow1}`}></div>
            
            {/* Top Gaussian Light (Studio Reflector Effect) */}
            <div className={`absolute -top-32 -left-16 w-[150%] h-[400px] bg-gradient-to-b ${statusConfig.glow2} to-transparent blur-[100px] opacity-70 pointer-events-none mix-blend-screen`}></div>
            
            {/* Bottom Gaussian Light */}
            <div className={`absolute -bottom-40 -right-16 w-[150%] h-[400px] bg-gradient-to-t ${statusConfig.glow3} to-transparent blur-[120px] opacity-80 pointer-events-none mix-blend-screen`}></div>
            
            {/* Digital Imaging Studio Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" 
                 style={{ 
                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                 }}>
            </div>

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
                    <span className={`w-2 h-2 rounded-full ${statusConfig.pulsePoint} mr-2 animate-pulse`}></span>
                    Portofolio Tracker
                </p>

                <div className="flex flex-col items-start">
                    <span className={`text-4xl font-black tracking-tighter leading-none mb-3 text-transparent bg-clip-text bg-gradient-to-r ${statusConfig.titleGradient} drop-shadow-sm`}>
                        {statusConfig.title}
                    </span>

                    <div className={`inline-flex items-center px-4 py-2 rounded-xl border ${statusConfig.badgeBg} ${statusConfig.badgeTextClass} text-sm font-bold mt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`}>
                        {statusConfig.badgeIcon}
                        {statusConfig.badgeText}
                    </div>
                </div>
            </div>

            {/* Stocks & Footer */}
            <div className="relative z-10 mt-auto">
                {activeStocks && activeStocks.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center mb-4 text-zinc-400/90">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-xs font-bold uppercase tracking-widest">Koleksi IPO</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {activeStocks.slice(0, 8).map((stock, i) => {
                                const isProfit = stock.percentage > 0;
                                const isLoss = stock.percentage < 0;
                                return (
                                    <div key={i} className="flex flex-col justify-center px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors relative overflow-hidden">
                                        <div className="flex flex-col space-y-2 relative z-10">
                                            <div className="flex items-center space-x-2">
                                                {stock.logo && (
                                                    <img src={stock.logo + (stock.logo.includes('?') ? '&' : '?') + 'cors=1'} crossOrigin="anonymous" alt={stock.code} className="w-7 h-7 rounded-full border border-white/20 object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-stock.svg'; }} />
                                                )}
                                                <span className="text-base font-black text-white">{stock.code}</span>
                                            </div>
                                            <div className={`inline-flex self-start items-center space-x-1 px-2.5 py-1 rounded-lg ${isProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : isLoss ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'} font-black text-xs`}>
                                                {isProfit && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                                {isLoss && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
                                                <span>
                                                    {isProfit ? '+' : ''}{stock.percentage % 1 === 0 ? stock.percentage : stock.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* Subtle background glow for profit/loss (Replaced blur with radial gradient) */}
                                        {isProfit && <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent rounded-full translate-x-4 -translate-y-4"></div>}
                                        {isLoss && <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/20 to-transparent rounded-full translate-x-4 -translate-y-4"></div>}
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
