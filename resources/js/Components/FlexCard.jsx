import React, { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, tier, activeStocks, isDarkMode = true }, ref) => {
    const totalProfit = activeStocks?.reduce((acc, stock) => acc + (stock.profit || 0), 0) || 0;
    
    // Config based on overall profit
    let statusConfig = {
        title: "CUAN",
        titleHighlight: "MAKSIMAL!",
        highlightColor: "#22c55e",
        subtitle: "Disiplin hari ini, bebas finansial nanti.",
        accentDark: "#052e16",
    };

    if (totalProfit < 0) {
        statusConfig = {
            title: "SABAR",
            titleHighlight: "BOSKU!",
            highlightColor: "#ef4444",
            subtitle: "Tetap tenang, badai pasti berlalu.",
            accentDark: "#450a0a",
        };
    } else if (totalProfit === 0 && activeStocks?.length === 0) {
        statusConfig = {
            title: "MULAI",
            titleHighlight: "INVESTASI!",
            highlightColor: "#3b82f6",
            subtitle: "Waktunya alokasi modal bosku.",
            accentDark: "#172554",
        };
    }

    // Generate a pseudo-random but deterministic sparkline path for each stock
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
            className="w-[400px] min-h-[640px] relative overflow-hidden text-white flex flex-col font-sans" 
            style={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: '#0A0D14'
            }}
        >
            {/* Background Pattern: Subtle dot grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)',
                backgroundSize: '20px 20px',
            }}></div>

            {/* Background glow orb top-right */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${statusConfig.highlightColor}15 0%, transparent 70%)`,
            }}></div>
            
            {/* Background glow orb bottom-left */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${statusConfig.highlightColor}10 0%, transparent 70%)`,
            }}></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1 p-8 pb-8">
                {/* Header: Logo and App Name */}
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: statusConfig.accentDark }}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={statusConfig.highlightColor}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L12 12l3 3 5-5m0 0h-4m4 0v4M4 17h.01" />
                        </svg>
                    </div>
                    <div className="flex space-x-1.5 font-extrabold tracking-[0.15em] text-[13px] uppercase">
                        <span className="text-white/90">PANTAU</span>
                        <span style={{ color: statusConfig.highlightColor }}>CUAN</span>
                    </div>
                </div>

                {/* Main Title Section */}
                <div className="mb-8">
                    <h1 className="text-[2.5rem] font-black tracking-tight leading-[1.1] mb-2.5">
                        <span className="text-white">{statusConfig.title} </span>
                        <span style={{ color: statusConfig.highlightColor }}>{statusConfig.titleHighlight}</span>
                    </h1>
                    <p className="text-[15px] font-medium" style={{ color: '#8B95A5' }}>{statusConfig.subtitle}</p>
                </div>

                {/* Thin accent line */}
                <div className="w-12 h-[3px] rounded-full mb-6" style={{ background: statusConfig.highlightColor, opacity: 0.5 }}></div>

                {/* Stocks List */}
                <div className="flex-1 flex flex-col space-y-2.5">
                    {activeStocks && activeStocks.length > 0 ? (
                        activeStocks.slice(0, 6).map((stock, i) => {
                            const isProfit = stock.percentage > 0;
                            const isLoss = stock.percentage < 0;
                            const sparkColor = isProfit ? '#22c55e' : isLoss ? '#ef4444' : '#4B5563';
                            
                            return (
                                <div key={i} className="flex items-center p-3.5 rounded-2xl relative overflow-hidden" style={{
                                    background: '#111621',
                                    border: '1px solid #1C2333',
                                }}>
                                    {/* Logo */}
                                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden mr-3" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <img 
                                            src={stock.logo} 
                                            alt={stock.code} 
                                            className="w-full h-full object-contain" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-stock.svg'; }} 
                                        />
                                    </div>
                                    
                                    {/* Ticker & Name */}
                                    <div className="flex flex-col min-w-0 w-20">
                                        <span className="text-[15px] font-extrabold text-white truncate tracking-wide">{stock.code}</span>
                                    </div>

                                    {/* Sparkline */}
                                    <div className="flex-1 h-7 flex items-center justify-center px-3">
                                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.7 }}>
                                            <path d={getSparklinePath(stock.code, isProfit)} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    {/* Badge */}
                                    <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-bold text-xs tabular-nums shrink-0" style={{
                                        background: isProfit ? '#052e16' : isLoss ? '#450a0a' : '#1C2333',
                                        color: isProfit ? '#22c55e' : isLoss ? '#ef4444' : '#8B95A5',
                                        border: `1px solid ${isProfit ? '#064e3b' : isLoss ? '#7f1d1d' : '#2A3441'}`,
                                    }}>
                                        {isProfit ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 17L17 7m0 0H8m9 0v9" /></svg>
                                        ) : isLoss ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 7l-10 10m0 0h9m-9 0V8" /></svg>
                                        ) : (
                                            <span>−</span>
                                        )}
                                        <span>
                                            {isProfit ? '+' : ''}{stock.percentage % 1 === 0 ? stock.percentage : stock.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-center py-10" style={{ opacity: 0.4 }}>
                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="#8B95A5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            <p className="text-sm font-medium" style={{ color: '#8B95A5' }}>Belum ada riwayat saham.</p>
                        </div>
                    )}
                </div>

                {/* User Footer */}
                <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.15)' }}>
                            <img 
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'I')}&background=18181b&color=fff&size=64&bold=true`}
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <span className="text-sm font-bold text-white/80 tracking-wide">{user?.name || 'Investor'}</span>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#4B5563' }}>pantaucuan.site</span>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;
