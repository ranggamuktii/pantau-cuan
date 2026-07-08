import { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, tier, activeStocks, isDarkMode = true }, ref) => {
    // Determine Bandar Tier based on the passed tier object from Dashboard
    let pangkat = tier?.name || "Kuli Pasar";
    let icon = tier?.icon || "🌱";
    let tierColor = tier?.name === 'Anak Sultan' ? 'text-purple-400' :
        tier?.name === 'Bandar Cilik' ? 'text-blue-400' :
            tier?.name === 'Juragan ARA' ? 'text-emerald-400' :
                tier?.name === 'Pedagang Asongan' ? 'text-amber-400' :
                    'text-zinc-400';
    let badgeBg = tier?.name === 'Anak Sultan' ? 'bg-purple-500/10 border-purple-500/40' :
        tier?.name === 'Bandar Cilik' ? 'bg-blue-500/10 border-blue-500/40' :
            tier?.name === 'Juragan ARA' ? 'bg-emerald-500/10 border-emerald-500/40' :
                tier?.name === 'Pedagang Asongan' ? 'bg-amber-500/10 border-amber-500/40' :
                    'bg-zinc-500/10 border-zinc-500/40';

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
        glow1: "from-emerald-500/5 via-transparent to-teal-500/5",
        glow2: "from-emerald-500/20",
        glow3: "from-teal-500/20",
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
            glow1: "from-rose-500/5 via-transparent to-red-500/5",
            glow2: "from-rose-500/20",
            glow3: "from-red-500/20",
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
            glow1: "from-blue-500/5 via-transparent to-indigo-500/5",
            glow2: "from-blue-500/20",
            glow3: "from-indigo-500/20",
            pulsePoint: "bg-blue-500"
        };
    }

    return (
        <div ref={ref} className={`w-[400px] min-h-[640px] relative overflow-hidden bg-[#030303] text-white rounded-[1.75rem] font-sans flex flex-col p-9 border border-zinc-800/80 shadow-2xl`} style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* Premium Background Gradients & Lighting (Replaced blur with radial gradients for html-to-image compatibility) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.glow1}`}></div>
            <div className={`absolute -top-32 -left-32 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${statusConfig.glow2} to-transparent rounded-full pointer-events-none`}></div>
            <div className={`absolute -bottom-32 -right-32 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${statusConfig.glow3} to-transparent rounded-full pointer-events-none`}></div>

            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Tier Seal — stamped badge in the corner, like a certificate of rank */}
            <div className={`absolute top-8 right-8 z-20 flex flex-col items-center justify-center w-[68px] h-[68px] rounded-full border border-dashed ${badgeBg.split(' ')[1]} rotate-[6deg]`}>
                <div className={`flex flex-col items-center justify-center w-[54px] h-[54px] rounded-full border ${badgeBg} ${tierColor}`}>
                    <span className="text-lg leading-none">{icon}</span>
                    <span className="text-[7px] font-black uppercase tracking-wider mt-1 text-center leading-tight px-1">{pangkat}</span>
                </div>
            </div>

            {/* Header — exchange ticker style masthead */}
            <div className="relative z-10 flex items-center gap-2 mb-1">
                <img src="/pantau-cuan-logo.svg" alt="Logo" className="h-5 opacity-90" />
                <span className="font-black text-[11px] tracking-[0.28em] uppercase opacity-80">Pantau Cuan</span>
                <span className="ml-auto flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                </span>
            </div>

            {/* Perforated ticket divider */}
            <div className="relative z-10 my-7 h-px border-t border-dashed border-zinc-800">
                <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030303] border border-zinc-800"></div>
                <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030303] border border-zinc-800"></div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 flex flex-col justify-center pb-6 pr-16">
                <p className={`text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.25em] font-mono`}>
                    Portofolio tracker
                </p>

                <div className="flex flex-col items-start">
                    <span className={`text-4xl font-black tracking-tighter leading-none mb-3 text-transparent bg-clip-text bg-gradient-to-r ${statusConfig.titleGradient} drop-shadow-sm`}>
                        {statusConfig.title}
                    </span>

                    <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusConfig.badgeBg} ${statusConfig.badgeTextClass} text-sm font-bold mt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`}>
                        {statusConfig.badgeIcon}
                        {statusConfig.badgeText}
                    </div>
                </div>
            </div>

            {/* Stocks & Footer */}
            <div className="relative z-10 mt-auto">
                {activeStocks && activeStocks.length > 0 && (
                    <div className="mb-7">
                        <div className="flex items-center mb-4 text-zinc-500">
                            <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">Koleksi IPO</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {activeStocks.slice(0, 8).map((stock, i) => {
                                const isProfit = stock.percentage > 0;
                                const isLoss = stock.percentage < 0;
                                return (
                                    <div key={i} className="flex flex-col justify-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
                                        <div className="flex flex-col space-y-2 relative z-10">
                                            <div className="flex items-center space-x-2">
                                                {stock.logo && (
                                                    <img src={stock.logo + (stock.logo.includes('?') ? '&' : '?') + 'cors=1'} crossOrigin="anonymous" alt={stock.code} className="w-6 h-6 rounded-full border border-white/20 object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-stock.svg'; }} />
                                                )}
                                                <span className="text-sm font-black text-white font-mono tracking-tight">{stock.code}</span>
                                            </div>
                                            <div className={`inline-flex self-start items-center space-x-1 px-2 py-0.5 rounded-md ${isProfit ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : isLoss ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'} font-bold text-[11px] font-mono tabular-nums`}>
                                                {isProfit && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                                {isLoss && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
                                                <span>
                                                    {isProfit ? '+' : ''}{stock.percentage % 1 === 0 ? stock.percentage : stock.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Perforated ticket divider */}
                <div className="relative h-px border-t border-dashed border-zinc-800 mb-6">
                    <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030303] border border-zinc-800"></div>
                    <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030303] border border-zinc-800"></div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'I')}&background=18181b&color=fff&size=128&bold=true`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg object-cover"
                        />
                        <div>
                            <p className="text-base font-black leading-none text-white tracking-wide">{user?.name || 'Investor'}</p>
                            <p className="text-[10px] font-bold text-zinc-500 mt-1.5 uppercase tracking-[0.2em] font-mono">pantaucuan.site</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;