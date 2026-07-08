import React, { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, tier, activeStocks, isDarkMode = true }, ref) => {
    const totalProfit = activeStocks?.reduce((acc, stock) => acc + (stock.profit || 0), 0) || 0;
    
    // Config based on overall profit
    let statusConfig = {
        title: "CUAN",
        titleHighlight: "MAKSIMAL!",
        highlightColor: "text-[#22c55e]", // emerald-500
        subtitle: "Disiplin hari ini, bebas finansial nanti.",
        iconBg: "bg-[#052e16]", // emerald-950
        iconColor: "text-[#22c55e]"
    };

    if (totalProfit < 0) {
        statusConfig = {
            title: "SABAR",
            titleHighlight: "BOSKU!",
            highlightColor: "text-[#ef4444]", // red-500
            subtitle: "Tetap tenang, badai pasti berlalu.",
            iconBg: "bg-[#450a0a]", // red-950
            iconColor: "text-[#ef4444]"
        };
    } else if (totalProfit === 0 && activeStocks?.length === 0) {
        statusConfig = {
            title: "MULAI",
            titleHighlight: "INVESTASI!",
            highlightColor: "text-[#3b82f6]", // blue-500
            subtitle: "Waktunya alokasi modal bosku.",
            iconBg: "bg-[#172554]", // blue-950
            iconColor: "text-[#3b82f6]"
        };
    }

    // Format current date
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(new Date());

    return (
        <div 
            ref={ref} 
            className="w-[400px] min-h-[640px] relative overflow-hidden bg-[#0A0D14] text-white flex flex-col p-8 pb-6 font-sans" 
            style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
            {/* Header: Logo and App Name */}
            <div className="flex items-center space-x-3 mb-10">
                <div className={`w-10 h-10 ${statusConfig.iconBg} rounded-xl flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${statusConfig.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L12 12l3 3 5-5m0 0h-4m4 0v4M4 17h.01" />
                    </svg>
                </div>
                <div className="flex space-x-1 font-bold tracking-widest text-[13px] uppercase">
                    <span className="text-white">PANTAU</span>
                    <span className={statusConfig.highlightColor}>CUAN</span>
                </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    <span className="text-white">{statusConfig.title} </span>
                    <span className={statusConfig.highlightColor}>{statusConfig.titleHighlight}</span>
                </h1>
                <p className="text-[#8B95A5] text-[15px] font-medium">{statusConfig.subtitle}</p>
            </div>

            {/* Stocks List */}
            <div className="flex-1 flex flex-col space-y-3 relative z-10">
                {activeStocks && activeStocks.length > 0 ? (
                    activeStocks.slice(0, 5).map((stock, i) => {
                        const isProfit = stock.percentage > 0;
                        const isLoss = stock.percentage < 0;
                        
                        return (
                            <div key={i} className="flex items-center justify-between p-4 bg-[#111621] rounded-2xl border border-[#1C2333] shadow-sm relative overflow-hidden">
                                
                                {/* Subtle internal glow */}
                                {isProfit && <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e] opacity-[0.03] blur-2xl pointer-events-none rounded-full translate-x-10 -translate-y-10"></div>}
                                {isLoss && <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444] opacity-[0.03] blur-2xl pointer-events-none rounded-full translate-x-10 -translate-y-10"></div>}

                                <div className="flex items-center space-x-3 z-10 w-2/5">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                                        <img 
                                            src={stock.logo + (stock.logo.includes('?') ? '&' : '?') + 'cors=1'} 
                                            crossOrigin="anonymous" 
                                            alt={stock.code} 
                                            className="w-full h-full object-contain" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-stock.svg'; }} 
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-base font-bold text-white truncate">{stock.code}</span>
                                        <span className="text-[11px] text-[#8B95A5] truncate font-medium">{stock.code} Corp.</span>
                                    </div>
                                </div>

                                {/* Dummy Sparkline Area */}
                                <div className="flex-1 h-8 flex items-center justify-center z-10 opacity-70 px-2">
                                    {isProfit ? (
                                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-[#22c55e]">
                                            <path d="M0,25 Q15,22 25,18 T45,15 T60,8 T80,5 T100,2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : isLoss ? (
                                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-[#ef4444]">
                                            <path d="M0,5 Q15,8 25,12 T45,15 T60,22 T80,25 T100,28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-[#4B5563]">
                                            <path d="M0,15 L20,14 L40,16 L60,15 L80,15 L100,16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>

                                {/* Badge */}
                                <div className="z-10 w-24 flex justify-end">
                                    <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-bold text-xs tabular-nums
                                        ${isProfit ? 'bg-[#052e16] text-[#22c55e] border-[#064e3b]' : 
                                          isLoss ? 'bg-[#450a0a] text-[#ef4444] border-[#7f1d1d]' : 
                                          'bg-[#1C2333] text-[#8B95A5] border-[#2A3441]'}`}
                                    >
                                        {isProfit ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 17L17 7m0 0H8m9 0v9" /></svg>
                                        ) : isLoss ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 17L7 7m10 10V8m0 9H8" /></svg>
                                        ) : (
                                            <span className="text-[10px]">−</span>
                                        )}
                                        <span>
                                            {isProfit || isLoss ? Math.abs(stock.percentage).toFixed(1) + '%' : '0%'}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50 py-10">
                        <svg className="w-12 h-12 mb-3 text-[#8B95A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <p className="text-sm font-medium text-[#8B95A5]">Belum ada riwayat saham.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 flex justify-center items-center text-center w-full">
                <p className="text-[#64748B] text-xs font-medium tracking-wide">Data per {formattedDate}</p>
            </div>
            
        </div>
    );
});

export default FlexCard;
