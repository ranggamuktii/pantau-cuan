import { forwardRef } from 'react';

const FlexCard = forwardRef(({ user, totalProfit, activeStocks, privacyMode = false }, ref) => {
    // Determine Bandar Tier based on totalProfit
    let pangkat = "Bandar Teri";
    let tierColor = "from-zinc-400 to-zinc-600";
    let icon = "🐟";
    
    if (totalProfit >= 100000000) { // 100 Juta+
        pangkat = "Bandar Paus";
        tierColor = "from-amber-400 to-orange-600";
        icon = "🐋";
    } else if (totalProfit >= 10000000) { // 10 Juta+
        pangkat = "Bandar Kakap";
        tierColor = "from-emerald-400 to-teal-600";
        icon = "🦈";
    }

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <div ref={ref} className="w-[360px] h-[640px] relative overflow-hidden bg-zinc-950 rounded-3xl text-white font-sans flex flex-col justify-between p-8" style={{ background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)' }}>
            {/* Background Decorations */}
            <div className={`absolute top-[-10%] right-[-20%] w-64 h-64 bg-gradient-to-br ${tierColor} rounded-full blur-[80px] opacity-40`}></div>
            <div className={`absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-gradient-to-tr ${tierColor} rounded-full blur-[80px] opacity-40`}></div>

            {/* Header */}
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                    <img src="/pantau-cuan-logo.svg" alt="Logo" className="h-6 opacity-70 mb-1" />
                    <span className="font-extrabold text-sm tracking-widest uppercase text-zinc-400">Pantau Cuan</span>
                </div>
                
                <h2 className="text-4xl font-black mb-2 leading-tight">IPO <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Wrapped</span></h2>
                
                <div className="mt-8 p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                    <p className="text-sm text-zinc-400 font-bold mb-1">Status Kehormatan</p>
                    <div className="flex items-center space-x-3">
                        <span className="text-4xl">{icon}</span>
                        <div>
                            <p className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${tierColor}`}>{pangkat}</p>
                            <p className="text-xs text-zinc-300 font-medium">Verified IPO Hunter</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 my-8">
                <p className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Total Potensi Cuan</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black text-white drop-shadow-lg">
                        {privacyMode ? 'Rp ✦✦✦.✦✦✦' : formatRupiah(totalProfit)}
                    </span>
                </div>
                {totalProfit > 0 && !privacyMode && (
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        All Time High
                    </div>
                )}
            </div>

            {/* Footer / Stocks */}
            <div className="relative z-10 mt-auto">
                {activeStocks && activeStocks.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs text-zinc-500 font-bold mb-2 uppercase">Saham Jagoan</p>
                        <div className="flex flex-wrap gap-2">
                            {activeStocks.slice(0, 4).map((stock, i) => (
                                <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white border border-white/10 backdrop-blur-sm">
                                    {stock}
                                </span>
                            ))}
                            {activeStocks.length > 4 && (
                                <span className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-bold text-zinc-400">
                                    +{activeStocks.length - 4} lainnya
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div>
                        <p className="text-sm font-bold text-white">{user?.name || 'Investor'}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">PantauCuan.com</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center">
                        {/* Placeholder QR Code - Just a stylized box for now */}
                        <div className="w-full h-full border-[3px] border-zinc-950 p-1 flex flex-wrap gap-0.5 relative">
                            <div className="w-2.5 h-2.5 bg-zinc-950"></div>
                            <div className="w-2.5 h-2.5 bg-zinc-950"></div>
                            <div className="w-2.5 h-2.5 bg-zinc-950"></div>
                            <div className="w-2.5 h-2.5 bg-zinc-950"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FlexCard;
