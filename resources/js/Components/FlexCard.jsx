import React, { forwardRef } from 'react';

// Curated quotes about investing & markets — rotates deterministically based on the day
const QUOTES = [
    { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
    { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
    { text: "The best investment you can make is in yourself.", author: "Warren Buffett" },
    { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
    { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
    { text: "Time in the market beats timing the market.", author: "Ken Fisher" },
    { text: "The individual investor should act as an investor, not as a speculator.", author: "Ben Graham" },
    { text: "Know what you own, and know why you own it.", author: "Peter Lynch" },
    { text: "Wide diversification is only required when investors do not understand what they are doing.", author: "Warren Buffett" },
    { text: "Bull markets are born on pessimism, grown on skepticism, and die on euphoria.", author: "John Templeton" },
    { text: "The four most dangerous words in investing are: This time it's different.", author: "John Templeton" },
    { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
];

const FlexCard = forwardRef(({ user, tier, activeStocks, isDarkMode = true }, ref) => {
    const totalProfit = activeStocks?.reduce((acc, stock) => acc + (stock.profit || 0), 0) || 0;
    
    // Pick a deterministic quote based on the day of the year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quote = QUOTES[dayOfYear % QUOTES.length];

    // Config based on overall profit
    let statusConfig = {
        title: "CUAN",
        titleHighlight: "MAKSIMAL!",
        accentColor: "#22c55e",
        accentDark: "#052e16",
        accentBorder: "#064e3b",
    };

    if (totalProfit < 0) {
        statusConfig = {
            title: "SABAR",
            titleHighlight: "BOSKU!",
            accentColor: "#ef4444",
            accentDark: "#450a0a",
            accentBorder: "#7f1d1d",
        };
    } else if (totalProfit === 0 && activeStocks?.length === 0) {
        statusConfig = {
            title: "MULAI",
            titleHighlight: "INVESTASI!",
            accentColor: "#3b82f6",
            accentDark: "#172554",
            accentBorder: "#1e3a5f",
        };
    }

    // Deterministic sparkline per ticker
    const getSparklinePath = (code, isUp) => {
        let hash = 0;
        for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
        const seed = Math.abs(hash);
        const points = [];
        for (let i = 0; i <= 6; i++) {
            const noise = ((seed * (i + 1) * 7) % 20) - 10;
            const baseY = isUp ? 25 - (i * 3.5) + noise * 0.3 : 5 + (i * 3.5) + noise * 0.3;
            points.push(`${(i / 6) * 100},${Math.max(2, Math.min(28, baseY))}`);
        }
        return `M${points.join(' L')}`;
    };

    return (
        <div 
            ref={ref} 
            className="w-[400px] min-h-[640px] relative overflow-hidden text-white flex flex-col" 
            style={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: 'linear-gradient(160deg, #0C1017 0%, #0A0D14 40%, #0D1119 100%)',
            }}
        >
            {/* Subtle top accent glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[2px] pointer-events-none" style={{
                background: `linear-gradient(90deg, transparent 0%, ${statusConfig.accentColor}40 50%, transparent 100%)`,
            }}></div>

            {/* Background ambient orb */}
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${statusConfig.accentColor}08 0%, transparent 65%)`,
            }}></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1 p-8 pb-7">
                
                {/* Header */}
                <div className="flex items-center space-x-2.5 mb-10">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ 
                        background: statusConfig.accentDark,
                        border: `1px solid ${statusConfig.accentBorder}`,
                    }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={statusConfig.accentColor} strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L12 12l3 3 5-5m0 0h-4m4 0v4" />
                        </svg>
                    </div>
                    <span className="font-extrabold tracking-[0.2em] text-[12px] uppercase text-white/70">PANTAUCUAN</span>
                </div>

                {/* Title */}
                <div className="mb-3">
                    <h1 className="text-[2.75rem] font-black leading-[1.05] tracking-[-0.02em]">
                        <span className="text-white">{statusConfig.title} </span>
                        <span style={{ color: statusConfig.accentColor }}>{statusConfig.titleHighlight}</span>
                    </h1>
                </div>

                {/* Quote */}
                <div className="mb-8">
                    <p className="text-[13px] leading-relaxed italic" style={{ color: '#6B7280' }}>
                        "{quote.text}"
                    </p>
                    <p className="text-[11px] mt-1 font-semibold" style={{ color: '#4B5563' }}>
                        — {quote.author}
                    </p>
                </div>

                {/* Stock Cards */}
                <div className="flex-1 flex flex-col space-y-2">
                    {activeStocks && activeStocks.length > 0 ? (
                        activeStocks.slice(0, 6).map((stock, i) => {
                            const isProfit = stock.percentage > 0;
                            const isLoss = stock.percentage < 0;
                            const sparkColor = isProfit ? '#22c55e' : isLoss ? '#ef4444' : '#4B5563';
                            const badgeBg = isProfit ? '#052e1680' : isLoss ? '#450a0a80' : '#1C233380';
                            const badgeColor = isProfit ? '#4ade80' : isLoss ? '#f87171' : '#6B7280';
                            const badgeBorder = isProfit ? '#064e3b' : isLoss ? '#7f1d1d' : '#2A3441';
                            
                            return (
                                <div key={i} className="flex items-center px-4 py-3 rounded-xl" style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}>
                                    {/* Logo */}
                                    <div className="w-8 h-8 rounded-full bg-white shrink-0 overflow-hidden mr-3 flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <img 
                                            src={stock.logo} 
                                            alt={stock.code} 
                                            className="w-full h-full object-contain" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-stock.svg'; }} 
                                        />
                                    </div>
                                    
                                    {/* Ticker */}
                                    <span className="text-[14px] font-bold text-white/90 w-14 shrink-0 tracking-wide">{stock.code}</span>

                                    {/* Sparkline */}
                                    <div className="flex-1 h-6 px-3">
                                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.5 }}>
                                            <path d={getSparklinePath(stock.code, isProfit)} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    {/* Percentage Badge */}
                                    <div className="flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-bold tabular-nums shrink-0" style={{
                                        background: badgeBg,
                                        color: badgeColor,
                                        border: `1px solid ${badgeBorder}`,
                                    }}>
                                        {isProfit ? (
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 17L17 7m0 0H8m9 0v9" /></svg>
                                        ) : isLoss ? (
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 7l-10 10m0 0h9m-9 0V8" /></svg>
                                        ) : (
                                            <span className="text-[9px]">−</span>
                                        )}
                                        <span>{isProfit ? '+' : ''}{stock.percentage % 1 === 0 ? stock.percentage : stock.percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-center py-10" style={{ opacity: 0.35 }}>
                            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="#6B7280"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Belum ada riwayat saham.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.12)' }}>
                            <img 
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=18181b&color=fff&size=56&bold=true`}
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <span className="text-[13px] font-semibold text-white/60">{user?.name || 'Investor'}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#374151' }}>pantaucuan.site</span>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;
