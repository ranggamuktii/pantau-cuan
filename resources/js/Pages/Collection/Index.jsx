import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function CollectionIndex({ accountSids }) {
    // Calculate Album Koleksi IPO
    const ipoCollection = [];
    accountSids.forEach(sid => {
        sid.transactions.forEach(trx => {
            const existing = ipoCollection.find(c => c.stock.stock_code === trx.stock.stock_code);
            const netProfit = Number(trx.net_profit) || 0;
            if (existing) {
                if (trx.status === 'closed') {
                    existing.net_profit += netProfit;
                    existing.has_closed = true;
                }
            } else {
                ipoCollection.push({ 
                    stock: trx.stock, 
                    net_profit: trx.status === 'closed' ? netProfit : 0,
                    has_closed: trx.status === 'closed'
                });
            }
        });
    });
    ipoCollection.sort((a, b) => b.net_profit - a.net_profit);

    const [filter, setFilter] = useState('all');

    const filteredCollection = ipoCollection.filter(item => {
        if (filter === 'shiny') return item.has_closed && item.net_profit > 0;
        if (filter === 'retak') return item.has_closed && item.net_profit <= 0;
        if (filter === 'aktif') return !item.has_closed;
        return true;
    });

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const FALLBACK_LOGO = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='2' width='16' height='20' rx='2' ry='2'/%3E%3Cpath d='M9 22v-4h6v4'/%3E%3Cpath d='M8 6h.01'/%3E%3Cpath d='M16 6h.01'/%3E%3Cpath d='M12 6h.01'/%3E%3Cpath d='M12 10h.01'/%3E%3Cpath d='M12 14h.01'/%3E%3Cpath d='M16 10h.01'/%3E%3Cpath d='M16 14h.01'/%3E%3Cpath d='M8 10h.01'/%3E%3Cpath d='M8 14h.01'/%3E%3C/svg%3E";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
            <Head title="Album Koleksi IPO" />

            <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
                            <Link href={route('dashboard')} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <h1 className="text-xl md:text-2xl font-black text-zinc-800 dark:text-white tracking-tight flex items-center gap-2">
                                <span>Album Koleksi</span>
                                <span className="bg-gojek-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-md leading-tight">Beta</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full flex flex-col">
                
                {/* Legend & Filter Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-base md:text-lg font-bold text-zinc-800 dark:text-zinc-200">Shiny</div>
                                    <div className="text-xs text-zinc-500 font-medium">Jual Cuan</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700/50">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-base md:text-lg font-bold text-zinc-800 dark:text-zinc-200">Retak</div>
                                    <div className="text-xs text-zinc-500 font-medium">Jual Boncos</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                                    <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-base md:text-lg font-bold text-zinc-800 dark:text-zinc-200">Aktif</div>
                                    <div className="text-xs text-zinc-500 font-medium">Masih Hold</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'all', label: 'Semua', count: ipoCollection.length },
                            { id: 'shiny', label: 'Shiny', count: ipoCollection.filter(i => i.has_closed && i.net_profit > 0).length },
                            { id: 'retak', label: 'Retak', count: ipoCollection.filter(i => i.has_closed && i.net_profit <= 0).length },
                            { id: 'aktif', label: 'Aktif', count: ipoCollection.filter(i => !i.has_closed).length },
                        ].map(f => (
                            <button 
                                key={f.id} 
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center space-x-2 ${filter === f.id ? 'bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                            >
                                <span>{f.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === f.id ? 'bg-white/20 dark:bg-zinc-900/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredCollection.map((item, idx) => {
                        const isShiny = item.has_closed && item.net_profit > 0;
                        const isRetak = item.has_closed && item.net_profit <= 0;
                        const isAktif = !item.has_closed;

                        return (
                            <div key={idx} className="group perspective-1000">
                                <div className={`relative w-full aspect-[2.5/3.5] rounded-2xl md:rounded-3xl p-1 md:p-1.5 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-y-6 transform-style-preserve-3d shadow-xl
                                    ${isShiny ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 shadow-amber-500/30 group-hover:shadow-amber-500/50' : ''}
                                    ${isRetak ? 'bg-zinc-300 dark:bg-zinc-700 grayscale-[0.8]' : ''}
                                    ${isAktif ? 'bg-blue-300 dark:bg-blue-800 border-2 border-dashed border-blue-400 dark:border-blue-600' : ''}
                                `}>
                                    
                                    {/* Inner Card */}
                                    <div className="relative w-full h-full bg-zinc-50 dark:bg-zinc-900 rounded-[1rem] md:rounded-[1.25rem] overflow-hidden flex flex-col transform-style-preserve-3d border border-white/50 dark:border-zinc-700/50">
                                        
                                        {/* Shiny Effects */}
                                        {isShiny && (
                                            <>
                                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200/50 via-transparent to-transparent opacity-70 z-10 pointer-events-none"></div>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 dark:via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-12 z-20 pointer-events-none"></div>
                                            </>
                                        )}

                                        {/* Retak Effects */}
                                        {isRetak && (
                                            <svg className="absolute inset-0 w-full h-full text-zinc-800/20 dark:text-zinc-100/10 pointer-events-none z-20" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <path stroke="currentColor" strokeWidth="1.5" d="M20,0 L35,30 L20,45 L45,70 L35,100 M65,0 L50,25 L75,50 L60,85 L85,100" />
                                            </svg>
                                        )}

                                        {/* Top Info */}
                                        <div className="p-3 pb-0 flex justify-between items-start z-10">
                                            <div className="text-[10px] md:text-xs font-black uppercase text-zinc-400 dark:text-zinc-500">
                                                {isShiny ? 'CUAN' : isRetak ? 'BONCOS' : 'HOLD'}
                                            </div>
                                            {isShiny && (
                                                <svg className="w-4 h-4 text-amber-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                            )}
                                        </div>

                                        {/* Logo Section */}
                                        <div className="flex-1 flex flex-col items-center justify-center p-3 z-10">
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-inner flex items-center justify-center p-2 mb-3 border-4 ${isShiny ? 'border-amber-200' : isRetak ? 'border-zinc-200' : 'border-blue-100'}`}>
                                                <img 
                                                    src={`https://assets.stockbit.com/logos/companies/${item.stock.stock_code}.png`} 
                                                    alt={item.stock.stock_code} 
                                                    className={`w-full h-full object-contain rounded-full ${isRetak ? 'grayscale' : ''}`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_LOGO; }} 
                                                    loading="lazy" 
                                                />
                                            </div>
                                            <div className={`text-xl md:text-2xl font-black text-center w-full truncate px-1 tracking-tighter drop-shadow-sm ${isShiny ? 'text-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                {item.stock.stock_code}
                                            </div>
                                        </div>

                                        {/* Bottom Stats */}
                                        <div className={`p-3 mt-auto z-10 border-t ${isShiny ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-100 dark:border-amber-900/50' : isRetak ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50' : 'bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-900/50'}`}>
                                            <div className="text-[10px] text-center font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Realized P/L</div>
                                            <div className={`text-center font-black ${isShiny ? 'text-emerald-600 dark:text-emerald-400' : isRetak ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}`}>
                                                {item.has_closed ? (
                                                    <>{item.net_profit > 0 ? '+' : ''}{formatIDR(item.net_profit)}</>
                                                ) : (
                                                    <span>BELUM JUAL</span>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCollection.length === 0 && (
                        <div className="col-span-full py-20 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center">
                            <svg className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-lg font-bold">Wah, ga ada kartu di filter ini bro!</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
