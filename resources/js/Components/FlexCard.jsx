import { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, totalProfit, activeStocks, privacyMode = false, isDarkMode = true }, ref) => {
    // Determine Bandar Tier based on totalProfit
    let pangkat = "Investor Pemula";
    let tierColor = "text-zinc-500";
    let badgeBg = "bg-zinc-100";
    let icon = "🌱";
    
    if (totalProfit >= 100000000) { // 100 Juta+
        pangkat = "Bandar Paus";
        tierColor = "text-amber-500";
        badgeBg = "bg-amber-50";
        icon = "🐋";
    } else if (totalProfit >= 10000000) { // 10 Juta+
        pangkat = "Bandar Kakap";
        tierColor = "text-emerald-500";
        badgeBg = "bg-emerald-50";
        icon = "🦈";
    } else if (totalProfit >= 1000000) { // 1 Juta+
        pangkat = "Trader Jagoan";
        tierColor = "text-blue-500";
        badgeBg = "bg-blue-50";
        icon = "🦅";
    }

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    // Card Colors based on theme (always dark mode for now to keep premium feel, but simpler)
    const bgClass = "bg-[#0A0A0A]";
    const textMain = "text-white";
    const textMuted = "text-zinc-400";
    const borderClass = "border-zinc-800";

    return (
        <div ref={ref} className={`w-[360px] h-[640px] relative overflow-hidden ${bgClass} ${textMain} rounded-3xl font-sans flex flex-col p-8`} style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            
            {/* Minimalist Grid Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-10">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <img src="/pantau-cuan-logo.svg" alt="Logo" className="h-5 opacity-90" />
                        <span className="font-bold text-xs tracking-widest uppercase opacity-70">Pantau Cuan</span>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full ${badgeBg} flex items-center space-x-1.5`}>
                    <span className="text-sm">{icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${tierColor}`}>{pangkat}</span>
                </div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <p className={`text-xs font-semibold ${textMuted} mb-3 uppercase tracking-widest`}>Total Potensi Profit</p>
                
                <div className="flex flex-col items-start">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3 break-all">
                        {privacyMode ? 'Rp ***.***' : formatRupiah(totalProfit)}
                    </span>
                    
                    {totalProfit > 0 && !privacyMode && (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            All Time High
                        </div>
                    )}
                </div>
            </div>

            {/* Stocks & Footer */}
            <div className="relative z-10 mt-auto">
                {activeStocks && activeStocks.length > 0 && (
                    <div className="mb-8">
                        <p className={`text-[10px] font-bold ${textMuted} mb-3 uppercase tracking-widest`}>Portofolio Andalan</p>
                        <div className="flex flex-wrap gap-2">
                            {activeStocks.slice(0, 5).map((stock, i) => (
                                <span key={i} className={`px-3 py-1.5 bg-zinc-900 rounded-md text-xs font-bold ${textMain} border border-zinc-800`}>
                                    {stock}
                                </span>
                            ))}
                            {activeStocks.length > 5 && (
                                <span className={`px-3 py-1.5 bg-transparent rounded-md text-xs font-medium ${textMuted}`}>
                                    +{activeStocks.length - 5} lainnya
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                <div className={`flex items-center justify-between pt-5 border-t ${borderClass}`}>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                            {(user?.name || 'I').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-none">{user?.name || 'Investor'}</p>
                            <p className={`text-[10px] ${textMuted} mt-1`}>pantaucuan.site</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;
