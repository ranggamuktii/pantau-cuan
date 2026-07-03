import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Wrapped({ wrapped }) {
    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(wrapped.share_link);
        alert('Link berhasil di-copy! Bagikan ke sosmed lu.');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-gojek-500 selection:text-white flex flex-col items-center py-10 px-4">
            <Head title={`IPO Wrapped - ${wrapped.owner_name}`} />

            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-gojek-400 to-emerald-400 bg-clip-text text-transparent">IPO Wrapped</h1>
                    <p className="text-zinc-400 font-medium">Kilas Balik {wrapped.owner_name}</p>
                </div>

                {/* Cards Container */}
                <div className="space-y-6">
                    
                    {/* IPO Count */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 text-center relative overflow-hidden group hover:border-gojek-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gojek-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">Total Emiten yang Diburu</h3>
                            <div className="text-6xl font-black text-white mb-2">{wrapped.total_ipos}</div>
                            <p className="text-zinc-500 text-sm">Gila, lu {wrapped.total_ipos > 10 ? 'udah sekelas bandar' : 'masih kembang kempis'} nangkep IPO tahun ini!</p>
                        </div>
                    </div>

                    {/* Total Profit */}
                    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 text-center relative overflow-hidden group transition-colors ${wrapped.total_net_profit >= 0 ? 'hover:border-emerald-500/50' : 'hover:border-rose-500/50'}`}>
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${wrapped.total_net_profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}></div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">Total Cuan Masuk Kantong</h3>
                            <div className={`text-4xl font-black mb-2 ${wrapped.total_net_profit > 0 ? 'text-emerald-400' : wrapped.total_net_profit < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                                {wrapped.total_net_profit > 0 ? '+' : ''}{formatIDR(wrapped.total_net_profit)}
                            </div>
                            <p className="text-zinc-500 text-sm">
                                {wrapped.total_net_profit > 0 ? 'Mantap! Wangi banget cuannya, bisa buat DP motor nih.' : wrapped.total_net_profit < 0 ? 'Sedih bro... Anggep aja sedekah ke market.' : 'Balik modal bro, lumayan ga rugi!'}
                            </p>
                        </div>
                    </div>

                    {/* Best Trade */}
                    {wrapped.best_trade && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-6 text-center">🏆 MVP Emiten Ter-Cuan</h3>
                            <div className="flex justify-between items-center bg-zinc-950 rounded-2xl p-4 border border-zinc-800/50">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-black text-xl text-white">{wrapped.best_trade.stock}</div>
                                        <div className="text-emerald-400 font-bold text-sm">+{wrapped.best_trade.percent.toFixed(2)}%</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-500 font-semibold mb-1">Untung</div>
                                    <div className="font-bold text-white">{formatIDR(wrapped.best_trade.profit)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Worst Trade */}
                    {wrapped.worst_trade && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-6 text-center">🤡 Badut ARB (Paling Boncos)</h3>
                            <div className="flex justify-between items-center bg-zinc-950 rounded-2xl p-4 border border-zinc-800/50">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center border border-rose-500/30">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-black text-xl text-white">{wrapped.worst_trade.stock}</div>
                                        <div className="text-rose-400 font-bold text-sm">{wrapped.worst_trade.percent.toFixed(2)}%</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-500 font-semibold mb-1">Rugi</div>
                                    <div className="font-bold text-white">{formatIDR(wrapped.worst_trade.loss)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Broker */}
                    {wrapped.top_broker && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 text-center">
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Sekuritas Andalan</h3>
                            <div className="text-3xl font-black text-gojek-400">{wrapped.top_broker}</div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex flex-col items-center space-y-4">
                    {wrapped.is_owner && (
                        <>
                            <button onClick={copyShareLink} className="flex items-center space-x-2 bg-gojek-500 hover:bg-gojek-600 text-white px-6 py-3 rounded-xl font-bold transition-colors w-full justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                <span>Bagikan ke Sosmed</span>
                            </button>
                            <Link href={route('dashboard')} className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors">
                                Kembali ke Dashboard
                            </Link>
                        </>
                    )}
                    {!wrapped.is_owner && (
                        <div className="text-center bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full">
                            <p className="text-zinc-400 text-sm mb-4">Mau punya beginian juga?</p>
                            <Link href={route('login')} className="inline-block bg-white text-zinc-900 px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                                Pake IPO Tracker Gratis
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
