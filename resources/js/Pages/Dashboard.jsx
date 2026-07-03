import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useState, Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, Transition, Combobox, Listbox } from '@headlessui/react';
import FeedbackWidget from '@/Components/FeedbackWidget';
import confetti from 'canvas-confetti';
const useCountdown = (targetDateStr) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

    useEffect(() => {
        if (!targetDateStr) return;

        const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
        const parts = targetDateStr.split(' ');
        if (parts.length < 3) return;

        const targetDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]), 9, 0, 0).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                    isPast: false
                });
            } else {
                setTimeLeft(prev => ({ ...prev, isPast: true }));
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDateStr]);

    return timeLeft;
};

const FALLBACK_LOGO = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='2' width='16' height='20' rx='2' ry='2'/%3E%3Cpath d='M9 22v-4h6v4'/%3E%3Cpath d='M8 6h.01'/%3E%3Cpath d='M16 6h.01'/%3E%3Cpath d='M12 6h.01'/%3E%3Cpath d='M12 10h.01'/%3E%3Cpath d='M12 14h.01'/%3E%3Cpath d='M16 10h.01'/%3E%3Cpath d='M16 14h.01'/%3E%3Cpath d='M8 10h.01'/%3E%3Cpath d='M8 14h.01'/%3E%3C/svg%3E";

const BROKERS = [
    { id: "PT Ajaib Sekuritas Asia (XC)", name: "Ajaib Sekuritas (XC)" },
    { id: "PT Stockbit Sekuritas Digital (XL)", name: "Stockbit Sekuritas (XL)" },
    { id: "PT Indo Premier Sekuritas (PD)", name: "Indo Premier (IPOT - PD)" },
    { id: "PT Mirae Asset Sekuritas Indonesia (YP)", name: "Mirae Asset (YP)" },
    { id: "PT Mandiri Sekuritas (CC)", name: "Mandiri Sekuritas (CC)" },
    { id: "PT BNI Sekuritas (NI)", name: "BNI Sekuritas (BIONS - NI)" },
    { id: "PT BRI Danareksa Sekuritas (OD)", name: "BRI Danareksa (OD)" },
    { id: "PT Trimegah Sekuritas Indonesia (LG)", name: "Trimegah Sekuritas (LG)" },
    { id: "PT MNC Sekuritas (EP)", name: "MNC Sekuritas (EP)" },
    { id: "PT Phillip Sekuritas Indonesia (KK)", name: "Phillip Sekuritas (KK)" },
    { id: "Other", name: "Other" }
];

export default function Dashboard({ auth, summary, charts, accountSids, emitenList, activeIpos, ipoCalendar, ipoDetails, ipoSubscriptions }) {
    const { flash } = usePage().props;
    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    const getMockUwStats = (uwName) => {
        const charCode = uwName.charCodeAt(0) + (uwName.length > 5 ? uwName.charCodeAt(5) : 0);
        const ara = (charCode % 5) + 3;
        const arb = (charCode % 3);
        const total = ara + arb + 2;
        return { total, ara, arb, stable: 2 };
    };
    const [isSidModalOpen, setIsSidModalOpen] = useState(false);
    const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
    const [selectedIpoDetails, setSelectedIpoDetails] = useState(null);
    const countdown = useCountdown(selectedIpoDetails?.schedule?.listing_date);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [priceData, setPriceData] = useState({ id: null, price: '' });
    const [selectedSid, setSelectedSid] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stockQuery, setStockQuery] = useState('');

    // CRUD States
    const [isEditSidModalOpen, setIsEditSidModalOpen] = useState(false);
    const [isDeleteSidModalOpen, setIsDeleteSidModalOpen] = useState(false);
    const [isEditTrxModalOpen, setIsEditTrxModalOpen] = useState(false);
    const [isDeleteTrxModalOpen, setIsDeleteTrxModalOpen] = useState(false);
    const [targetSid, setTargetSid] = useState(null);
    const [targetTrx, setTargetTrx] = useState(null);
    const [mobileTab, setMobileTab] = useState('portfolio');

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') !== 'light';
        }
        return true;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Avg Down Calculator State
    const [isAvgCalcOpen, setIsAvgCalcOpen] = useState(false);
    const [avgCalcData, setAvgCalcData] = useState({ trx: null, additionalLots: '', newPrice: '' });

    useEffect(() => {
        if (flash.success && flash.success !== toast.message) {
            setToast({ show: true, message: flash.success, type: 'success' });
        } else if (flash.error && flash.error !== toast.message) {
            setToast({ show: true, message: flash.error, type: 'error' });
        }
    }, [flash.success, flash.error]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const allEmiten = [...new Set([...emitenList, ...(activeIpos?.map(ipo => ipo.ticker) || [])])];

    const filteredStocks = stockQuery === ''
        ? allEmiten
        : allEmiten.filter((stock) => stock.toLowerCase().includes(stockQuery.toLowerCase())).slice(0, 50);

    const handleSyncPrices = () => {
        setIsSyncing(true);
        router.post(route('stocks.sync'), {}, {
            preserveScroll: true,
            onFinish: () => setIsSyncing(false),
        });
    };

    const handleManualPrice = (stockId, currentPrice, basePrice) => {
        setPriceData({ id: stockId, price: currentPrice, base_price: basePrice });
        setIsPriceModalOpen(true);
    };

    const getBrokerLogo = (brokerName) => {
        if (!brokerName) return null;
        const domains = {
            'Ajaib': 'ajaib.co.id',
            'Stockbit': 'stockbit.com',
            'Indo Premier': 'indopremier.com',
            'Mirae': 'miraeasset.co.id',
            'Mandiri': 'mandirisekuritas.co.id',
            'BNI': 'bnisekuritas.co.id',
            'BRI': 'bridanareksasekuritas.co.id',
            'Trimegah': 'trimegah.com',
            'MNC': 'mncsekuritas.id',
            'Phillip': 'poems.co.id'
        };

        for (const [key, domain] of Object.entries(domains)) {
            if (brokerName.includes(key)) {
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            }
        }
        return `https://ui-avatars.com/api/?name=${brokerName.charAt(0)}&background=random&color=fff&size=128&font-size=0.4&bold=true`;
    };

    const submitPriceUpdate = (e) => {
        e.preventDefault();
        if (priceData.price !== '' && !isNaN(priceData.price)) {
            router.post(route('stocks.updatePrice', priceData.id), { current_price: priceData.price }, {
                preserveScroll: true,
                onSuccess: () => setIsPriceModalOpen(false)
            });
        }
    };

    const { data: sidData, setData: setSidData, post: postSid, processing: processingSid, reset: resetSid } = useForm({
        sid_name: '',
        broker_name: '',
    });

    const { data: editSidData, setData: setEditSidData, put: putSid, processing: processingEditSid } = useForm({
        sid_name: '',
        broker_name: '',
    });

    const { data: trxData, setData: setTrxData, post: postTrx, processing: processingTrx, reset: resetTrx } = useForm({
        account_sid_id: '',
        stock_code: '',
        ipo_price: '',
        lots: '',
    });

    const { data: editTrxData, setData: setEditTrxData, put: putTrx, processing: processingEditTrx } = useForm({
        ipo_price: '',
        lots: '',
    });

    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [targetSellTrx, setTargetSellTrx] = useState(null);
    const [isTierModalOpen, setIsTierModalOpen] = useState(false);

    const getTierLevel = (netProfit) => {
        if (netProfit <= 0) return { name: 'Kuli Pasar', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-3-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2.88 5.76a.75.75 0 0 0-1.24 0A4.996 4.996 0 0 0 12 17a4.996 4.996 0 0 0-1.88-2.24.75.75 0 0 0-1.24.01" clipRule="evenodd" /></svg>, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', next: 500000, nextName: 'Pedagang Asongan', min: 0 };
        if (netProfit <= 500000) return { name: 'Pedagang Asongan', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V6zm-1.5 5a1.5 1.5 0 011.5-1.5h18a1.5 1.5 0 011.5 1.5v7a3 3 0 01-3 3H4.5a3 3 0 01-3-3v-7zm7.5 1a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z" clipRule="evenodd" /></svg>, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', next: 2000000, nextName: 'Juragan ARA', min: 0 };
        if (netProfit <= 2000000) return { name: 'Juragan ARA', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5v16.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 0-1.5H3.75V3.75a.75.75 0 0 0-.75-.75Zm5.213 11.287 4.5-4.5 2.53 2.53a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06l-4.47 4.47-2.53-2.53a.75.75 0 0 0-1.06 0l-5 5a.75.75 0 0 0 1.06 1.06Z" clipRule="evenodd" /></svg>, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', next: 10000000, nextName: 'Bandar Cilik', min: 500000 };
        if (netProfit <= 10000000) return { name: 'Bandar Cilik', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.36-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v.149c1-.1 2-.17 3-.205v-.149c0-.828-.672-1.5-1.5-1.5z" clipRule="evenodd" /><path d="M2.25 13.918c1.385.498 2.864.876 4.412 1.121A26.177 26.177 0 0012 17.25a26.177 26.177 0 005.338-.561 24.73 24.73 0 004.412-1.121v3.918c0 1.434-1.022 2.7-2.476 2.917A48.796 48.796 0 0112 22.5c-2.43 0-4.817-.178-7.152-.52-1.454-.218-2.476-1.483-2.476-2.917v-3.918z" /></svg>, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', next: 50000000, nextName: 'Anak Sultan', min: 2000000 };
        return { name: 'Anak Sultan', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', next: null, nextName: null, min: 10000000 };
    };

    const totalGlobalNetProfit = accountSids.reduce((acc, sid) => acc + sid.transactions.filter(t => t.status === 'closed').reduce((sum, trx) => sum + (Number(trx.net_profit) || 0), 0), 0);
    const currentTier = getTierLevel(totalGlobalNetProfit);

    // Calculate Album Koleksi IPO
    const ipoCollection = [];
    accountSids.forEach(sid => {
        sid.transactions.forEach(trx => {
            const existing = ipoCollection.find(c => c.stock.stock_code === trx.stock.stock_code);
            if (existing) {
                if (trx.status === 'closed') {
                    existing.net_profit += trx.net_profit;
                    existing.has_closed = true;
                }
            } else {
                ipoCollection.push({ 
                    stock: trx.stock, 
                    net_profit: trx.status === 'closed' ? trx.net_profit : 0,
                    has_closed: trx.status === 'closed'
                });
            }
        });
    });
    ipoCollection.sort((a, b) => b.net_profit - a.net_profit);

    const { data: sellData, setData: setSellData, post: postSell, processing: processingSell, reset: resetSell, errors: sellErrors } = useForm({
        sell_price: '',
        lots: '',
    });

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const submitSid = (e) => {
        e.preventDefault();
        postSid(route('sids.store'), {
            onSuccess: () => { setIsSidModalOpen(false); resetSid(); },
        });
    };

    const submitTrx = (e) => {
        e.preventDefault();
        postTrx(route('transactions.store'), {
            onSuccess: () => { setIsTrxModalOpen(false); resetTrx(); },
        });
    };

    const openTrxModal = (sidId) => {
        setTrxData('account_sid_id', sidId);
        setIsTrxModalOpen(true);
    };

    const openEditSid = (sid) => {
        setTargetSid(sid);
        setEditSidData({ sid_name: sid.sid_name, broker_name: sid.broker_name || '' });
        setIsEditSidModalOpen(true);
    };

    const openDeleteSid = (sid) => {
        setTargetSid(sid);
        setIsDeleteSidModalOpen(true);
    };

    const openSellModal = (trx) => {
        setTargetSellTrx(trx);
        setSellData({
            sell_price: trx.stock.current_price ?? trx.buy_price,
            lots: trx.lots,
        });
        setIsSellModalOpen(true);
    };

    const submitSell = (e) => {
        e.preventDefault();
        postSell(route('transactions.sell', targetSellTrx.id), {
            onSuccess: () => {
                const profit = ((sellData.sell_price || 0) - (targetSellTrx?.buy_price || 0)) * (sellData.lots || 0) * 100;
                if (profit > 0) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24']
                    });
                }
                
                setIsSellModalOpen(false);
                setTargetSellTrx(null);
                resetSell();
            },
        });
    };

    const calculateAvgDown = () => {
        if (!avgCalcData.trx) return null;
        const oldLots = avgCalcData.trx.lots;
        const oldPrice = avgCalcData.trx.buy_price;
        const addLots = parseInt(avgCalcData.additionalLots) || 0;
        const newPrice = parseInt(avgCalcData.newPrice) || 0;

        if (addLots === 0 || newPrice === 0) return null;

        const totalOldCost = oldLots * 100 * oldPrice;
        const totalNewCost = addLots * 100 * newPrice;
        const newAvg = (totalOldCost + totalNewCost) / ((oldLots + addLots) * 100);
        return {
            newAvgPrice: Math.round(newAvg),
            totalNewCapital: totalOldCost + totalNewCost
        };
    };

    const submitEditSid = (e) => {
        e.preventDefault();
        putSid(route('sids.update', targetSid.id), {
            onSuccess: () => setIsEditSidModalOpen(false)
        });
    };

    const submitDeleteSid = () => {
        if (!targetSid) return;
        setIsDeleteSidModalOpen(false);
        router.delete(route('sids.destroy', targetSid.id));
    };

    const openEditTrx = (trx) => {
        setTargetTrx(trx);
        setEditTrxData({ ipo_price: trx.buy_price, lots: trx.lots });
        setIsEditTrxModalOpen(true);
    };

    const openDeleteTrx = (trx) => {
        setTargetTrx(trx);
        setIsDeleteTrxModalOpen(true);
    };

    const submitEditTrx = (e) => {
        e.preventDefault();
        putTrx(route('transactions.update', targetTrx.id), {
            onSuccess: () => setIsEditTrxModalOpen(false)
        });
    };

    const submitDeleteTrx = () => {
        if (!targetTrx) return;
        setIsDeleteTrxModalOpen(false);
        router.delete(route('transactions.destroy', targetTrx.id));
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] font-sans selection:bg-gojek-100 selection:text-gojek-900 dark:selection:bg-gojek-900 dark:selection:text-gojek-100 overflow-hidden h-screen flex flex-col relative z-0">
            {/* Aurora Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-gojek-400/20 dark:bg-gojek-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 dark:opacity-20 animate-blob"></div>
                <div className="absolute top-40 -left-40 w-[40rem] h-[40rem] bg-emerald-400/20 dark:bg-emerald-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 dark:opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-1/2 w-[40rem] h-[40rem] bg-zinc-400/20 dark:bg-zinc-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 dark:opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            <Head>
                <title>Pantau Cuan - Portofolio & Info IPO</title>
                <meta name="description" content="Pantau Cuan - Lacak alokasi IPO, pantau harga real-time, dan temukan penawaran saham terbaru di Indonesia." />
                <meta name="keywords" content="IPO, Saham, BEI, Bursa Efek Indonesia, Tracker, Portfolio, e-IPO, Pantau Cuan" />
                <meta property="og:title" content="Pantau Cuan - Portofolio & Info IPO" />
                <meta property="og:description" content="Pantau Cuan - Lacak alokasi IPO, pantau harga real-time, dan temukan penawaran saham terbaru di Indonesia." />
            </Head>

            {/* Clean Top Navigation */}
            <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 md:h-20">
                        <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
                            <div className="flex items-center justify-center space-x-2 md:space-x-3">
                                <svg className="h-6 w-6 md:h-8 md:w-8 text-gojek-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" /></svg>
                                <span className="text-xl md:text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Pantau<span className="text-gojek-500 dark:text-gojek-400">Cuan</span></span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-6 shrink-0">
                            <div className="flex items-center space-x-2 md:space-x-4">
                                {auth.user ? (
                                    <>
                                        {auth.user.avatar ? (
                                            <img src={auth.user.avatar} alt="Avatar" loading="lazy" className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gojek-500 to-gojek-400 p-0.5 shadow-sm shrink-0">
                                                <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-gojek-500 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="hidden sm:flex items-center space-x-3">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200 leading-tight whitespace-nowrap">{auth.user.name}</span>
                                            <button onClick={() => setIsTierModalOpen(true)} className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${currentTier.bg} transition-all duration-300 group cursor-help border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5`}>
                                                <span className={`${currentTier.color} group-hover:scale-110 transition-transform scale-90`}>{currentTier.icon}</span>
                                                <span className={`text-[11px] font-bold ${currentTier.color}`}>{currentTier.name}</span>
                                            </button>
                                        </div>
                                        <div className="w-px h-5 md:h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 md:mx-2 hidden sm:block"></div>
                                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Toggle Theme">
                                            {isDarkMode ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                            )}
                                        </button>
                                        <Link href={route('logout')} method="post" as="button" className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Logout">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Toggle Theme">
                                            {isDarkMode ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                            )}
                                        </button>
                                        <Link href={route('login')} className="ml-2 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-gojek-500 rounded-lg hover:bg-gojek-600 shadow-sm">
                                            Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 xl:pb-6 flex-1 overflow-hidden flex flex-col w-full min-h-0">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight">Portofoliomu</h1>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Pantau alokasi IPO, cek harga real-time, dan intip saham baru yang lagi hits.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0 pb-4">
                    {/* LEFT COLUMN: MAIN PORTFOLIO */}
                    <div className={`${mobileTab === 'portfolio' ? 'flex' : 'hidden'} xl:flex xl:col-span-2 space-y-12 flex-col order-last xl:order-first overflow-y-auto xl:pr-4 pb-10 animate-fade-in-up`}>

                        {/* Summary Cards */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Ringkasan Cuan</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                                {[
                                    { label: 'Total Modal', value: formatIDR(summary.totalCapital), color: 'text-white', isTrend: false, bg: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border-zinc-800 shadow-xl shadow-zinc-900/20', labelColor: 'text-zinc-400', icon: <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, sparklineColor: 'text-zinc-700/50' },
                                    { label: 'Nilai Saat Ini', value: formatIDR(summary.totalCurrentValue), color: 'text-zinc-900 dark:text-white', isTrend: false, bg: 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 shadow-sm', labelColor: 'text-zinc-500 dark:text-zinc-400', icon: <svg className="w-5 h-5 text-gojek-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, sparklineColor: 'text-gojek-100 dark:text-gojek-900/40' },
                                    { label: 'Potensi Cuan', value: (summary.totalFloatingProfit > 0 ? '+' : '') + formatIDR(summary.totalFloatingProfit), color: summary.totalFloatingProfit > 0 ? 'text-emerald-700 dark:text-emerald-400' : summary.totalFloatingProfit < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200', isTrend: true, raw: summary.totalFloatingProfit, bg: summary.totalFloatingProfit > 0 ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-900/40 border-emerald-200 dark:border-emerald-900/50 shadow-sm shadow-emerald-100/50' : summary.totalFloatingProfit < 0 ? 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-zinc-900/40 border-rose-200 dark:border-rose-900/50 shadow-sm shadow-rose-100/50' : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800', labelColor: 'text-zinc-500 dark:text-zinc-400', sparklineColor: summary.totalFloatingProfit > 0 ? 'text-emerald-100 dark:text-emerald-900/40' : 'text-rose-100 dark:text-rose-900/40' },
                                    { label: 'Cuan Masuk Kantong', value: (summary.totalNetProfit > 0 ? '+' : '') + formatIDR(summary.totalNetProfit), color: summary.totalNetProfit > 0 ? 'text-emerald-700 dark:text-emerald-400' : summary.totalNetProfit < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200', isTrend: true, raw: summary.totalNetProfit, bg: summary.totalNetProfit > 0 ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-900/40 border-emerald-200 dark:border-emerald-900/50 shadow-sm shadow-emerald-100/50' : summary.totalNetProfit < 0 ? 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-zinc-900/40 border-rose-200 dark:border-rose-900/50 shadow-sm shadow-rose-100/50' : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800', labelColor: 'text-zinc-500 dark:text-zinc-400', sparklineColor: summary.totalNetProfit > 0 ? 'text-emerald-100 dark:text-emerald-900/40' : 'text-rose-100 dark:text-rose-900/40' },
                                ].map((card, i) => (
                                    <div key={i} className={`border p-6 rounded-[1.25rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${card.bg}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`text-xs font-bold uppercase tracking-wider relative z-10 ${card.labelColor}`}>{card.label}</div>
                                            {card.icon ? card.icon : (card.isTrend && card.raw !== 0 && (
                                                <div className={`flex items-center justify-center p-1.5 rounded-lg relative z-10 ${card.raw > 0 ? 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100/80 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'}`}>
                                                    {card.raw > 0 ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`text-2xl font-black relative z-10 tracking-tight tabular-nums ${card.color}`}>{card.value}</div>

                                        {/* Sparklines Background */}
                                        <div className={`absolute bottom-0 left-0 w-full h-1/2 opacity-60 pointer-events-none ${card.sparklineColor}`}>
                                            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                                                {(!card.isTrend || card.raw >= 0) ? (
                                                    <path d="M0,30 Q10,15 20,20 T40,10 T60,15 T80,5 T100,0 L100,30 Z" fill="currentColor" opacity="0.3" />
                                                ) : (
                                                    <path d="M0,0 Q10,15 20,10 T40,20 T60,15 T80,25 T100,30 L100,30 L0,30 Z" fill="currentColor" opacity="0.3" />
                                                )}
                                                {(!card.isTrend || card.raw >= 0) ? (
                                                    <path d="M0,30 Q10,15 20,20 T40,10 T60,15 T80,5 T100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                ) : (
                                                    <path d="M0,0 Q10,15 20,10 T40,20 T60,15 T80,25 T100,30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                )}
                                            </svg>
                                        </div>

                                        {card.isTrend && card.raw !== 0 && (
                                            <div className="absolute -bottom-6 -right-6 opacity-[0.03] dark:opacity-[0.02] pointer-events-none transform -rotate-12">
                                                {card.raw > 0 ? (
                                                    <svg className="w-32 h-32 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                ) : (
                                                    <svg className="w-32 h-32 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Alokasi Portofolio</h2>
                                <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto hide-scrollbar">
                                    <button
                                        onClick={handleSyncPrices}
                                        disabled={isSyncing}
                                        className={`whitespace-nowrap group relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg focus:outline-none border shadow-sm ${isSyncing ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 cursor-not-allowed' : 'bg-white dark:bg-zinc-900 text-gojek-600 dark:text-gojek-400 hover:bg-gojek-50 dark:hover:bg-gojek-900/30 border-gojek-200 dark:border-gojek-800 hover:border-gojek-300 dark:hover:border-gojek-700'}`}
                                    >
                                        {isSyncing ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        )}
                                        <span>{isSyncing ? 'Lagi Update...' : 'Update Harga'}</span>
                                    </button>
                                    {auth.user ? (
                                        <button
                                            onClick={() => setIsSidModalOpen(true)}
                                            className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-gojek-500 border border-transparent rounded-lg hover:bg-gojek-600 shadow-sm focus:outline-none"
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            Tambah Akun SID
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('login')}
                                            className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-gojek-500 border border-transparent rounded-lg hover:bg-gojek-600 shadow-sm focus:outline-none"
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            Login Buat Pantau
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {!auth.user ? (
                                <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-[1.5rem] p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Login Dulu Bro!</h3>
                                    <p className="mt-1 text-zinc-500 dark:text-zinc-400">Buat bisa pakai fitur Tracker Portofolio, lo harus login dulu ya.</p>
                                    <Link href={route('login')} className="inline-block mt-6 px-5 py-2.5 bg-gojek-500 text-white rounded-lg font-medium hover:bg-gojek-600 transition-colors shadow-sm">
                                        Login Pakai Google
                                    </Link>
                                </div>
                            ) : accountSids.length === 0 ? (
                                <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-[1.5rem] p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Belum Ada Akun SID</h3>
                                    <p className="mt-1 text-zinc-500 dark:text-zinc-400">Yuk, tambahin akun SID kamu biar bisa mulai pantau alokasi IPO!</p>
                                    <button onClick={() => setIsSidModalOpen(true)} className="mt-6 px-5 py-2.5 bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                                        Buat SID Sekarang
                                    </button>
                                </div>
                            ) : (
                                accountSids.map((sid) => {
                                    const totalSidFloating = sid.transactions.filter(t => t.status === 'open').reduce((acc, trx) => {
                                        const currentPrice = trx.stock.current_price || trx.stock.ipo_price;
                                        return acc + (currentPrice - trx.buy_price) * (trx.lots * 100);
                                    }, 0);

                                    return (
                                        <div key={sid.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                                            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                <div className="flex items-center space-x-4">
                                                    {getBrokerLogo(sid.broker_name) ? (
                                                        <img src={getBrokerLogo(sid.broker_name)} alt="Broker Logo" className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white object-contain p-1" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-semibold text-lg border border-zinc-300 dark:border-zinc-700">
                                                            {sid.sid_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-lg font-bold text-zinc-800 dark:text-white">{sid.sid_name}</h4>
                                                        <p className="text-xs font-medium text-zinc-500 dark:text-white">{sid.broker_name || 'Belum ada Sekuritas'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => openEditSid(sid)} className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit SID">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => openDeleteSid(sid)} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" title="Delete SID">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
                                                    <button onClick={() => openTrxModal(sid.id)} className="flex items-center space-x-1 px-4 py-2 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors shadow-sm">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                        <span>Tambah Saham</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                                                    <thead className="bg-white dark:bg-zinc-900">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Saham</th>
                                                            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Lot</th>
                                                            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Beli</th>
                                                            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Harga Pasar</th>
                                                            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">P/L</th>
                                                            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-50 dark:divide-zinc-800">
                                                        {(() => {
                                                            const openTransactions = sid.transactions.filter(t => t.status === 'open');
                                                            if (openTransactions.length === 0) {
                                                                return <tr><td colSpan="6" className="px-6 py-6 text-center text-zinc-400 dark:text-zinc-500 text-sm">Belum ada saham aktif di portofolio ini.</td></tr>;
                                                            }
                                                            return openTransactions.map((trx) => {
                                                                const stock = trx.stock;
                                                                const shares = trx.lots * 100;
                                                                let currentPrice = stock.current_price;
                                                                if (!currentPrice) {
                                                                    const isOffering = activeIpos?.some(ipo => ipo.ticker === stock.stock_code);
                                                                    if (!isOffering && stock.ipo_price > 0) {
                                                                        // Mock price for listed stocks
                                                                        const mockMultiplier = 1 + (stock.stock_code.length % 3 === 0 ? 0.35 : (stock.stock_code.length % 2 === 0 ? -0.15 : 0.20));
                                                                        currentPrice = Math.round(stock.ipo_price * mockMultiplier);
                                                                    } else {
                                                                        currentPrice = stock.ipo_price;
                                                                    }
                                                                }

                                                                const floating = (currentPrice - trx.buy_price) * shares;
                                                                const floatPercent = trx.buy_price > 0 ? ((currentPrice - trx.buy_price) / trx.buy_price) * 100 : 0;

                                                                return (
                                                                    <tr key={trx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center space-x-3">
                                                                                <img
                                                                                    src={`https://assets.stockbit.com/logos/companies/${stock.stock_code}.png`}
                                                                                    alt={stock.stock_code}
                                                                                    className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 object-contain bg-white"
                                                                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_LOGO; }}
                                                                                />
                                                                                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stock.stock_code}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-600 dark:text-zinc-300">{trx.lots}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-600 dark:text-zinc-300">{formatIDR(trx.buy_price)}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                            <div className="relative group/tooltip inline-flex items-center justify-end">
                                                                                <button onClick={() => handleManualPrice(stock.id, currentPrice, trx.buy_price)} className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200/50 dark:border-zinc-700 hover:border-gojek-300 dark:hover:border-gojek-600 group/btn">
                                                                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 group-hover/btn:text-gojek-600 dark:group-hover/btn:text-gojek-400 transition-colors">{formatIDR(currentPrice)}</span>
                                                                                    <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover/btn:text-gojek-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                                </button>
                                                                                <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-800 dark:border-zinc-200">
                                                                                    ✏️ Ubah Harga Pasar
                                                                                    <div className="absolute top-full right-6 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-200"></div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                            <div className={`text-sm font-semibold ${floating > 0 ? 'text-emerald-600 dark:text-emerald-400' : floating < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                                                {floating > 0 ? '+' : ''}{formatIDR(floating)}
                                                                            </div>
                                                                            <div className={`text-xs ${floating > 0 ? 'text-emerald-500' : floating < 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                                                                                {floating > 0 ? '+' : ''}{floatPercent.toFixed(2)}%
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                            <div className="flex items-center justify-end space-x-1">
                                                                                <div className="relative group/tooltip">
                                                                                    <button onClick={() => { setAvgCalcData({ trx: trx, additionalLots: '', newPrice: '' }); setIsAvgCalcOpen(true); }} className="p-1.5 text-gojek-500 hover:text-gojek-700 hover:bg-gojek-50 dark:hover:bg-gojek-900/30 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></button>
                                                                                    <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-800 dark:border-zinc-200">
                                                                                        🧮 Simulasikan Average
                                                                                        <div className="absolute top-full right-2 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-200"></div>
                                                                                    </div>
                                                                                </div>
                                                                                {trx.status === 'open' && (
                                                                                    <div className="relative group/tooltip">
                                                                                        <button onClick={() => openSellModal(trx)} className="p-1.5 text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                                                                                        <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-800 dark:border-zinc-200">
                                                                                            💸 Jual Saham
                                                                                            <div className="absolute top-full right-2 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-200"></div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="relative group/tooltip">
                                                                                    <button onClick={() => openEditTrx(trx)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                                                                    <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-800 dark:border-zinc-200">
                                                                                        ⚙️ Edit Alokasi
                                                                                        <div className="absolute top-full right-2 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-200"></div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="relative group/tooltip">
                                                                                    <button onClick={() => openDeleteTrx(trx)} className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                                                    <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-800 dark:border-zinc-200">
                                                                                        🗑️ Hapus Catatan
                                                                                        <div className="absolute top-full right-2 w-2.5 h-2.5 bg-zinc-900 dark:bg-white rotate-45 -mt-1.5 border-r border-b border-zinc-800 dark:border-zinc-200"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        })()}
                                                    </tbody>
                                                    {sid.transactions.filter(t => t.status === 'open').length > 0 && (
                                                        <tfoot className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Potensi P/L</td>
                                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                    <div className={`text-sm font-extrabold ${totalSidFloating > 0 ? 'text-emerald-600 dark:text-emerald-400' : totalSidFloating < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                                        {totalSidFloating > 0 ? '+' : ''}{formatIDR(totalSidFloating)}
                                                                    </div>
                                                                </td>
                                                                <td></td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>

                                            {/* History Section */}
                                            {sid.transactions.filter(t => t.status === 'closed').length > 0 && (
                                                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6 px-2 pb-2">
                                                    <h5 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                        <span>Riwayat Penjualan</span>
                                                    </h5>
                                                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-sm">
                                                        <table className="w-full text-left border-collapse text-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Saham</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lot</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Beli</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Jual</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Realized P/L</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                                {sid.transactions.filter(t => t.status === 'closed').map(trx => (
                                                                    <tr key={trx.id}>
                                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                                            <div className="flex items-center space-x-3">
                                                                                <img
                                                                                    src={`https://assets.stockbit.com/logos/companies/${trx.stock.stock_code}.png`}
                                                                                    alt={trx.stock.stock_code}
                                                                                    className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 object-contain bg-white"
                                                                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_LOGO; }}
                                                                                />
                                                                                <span className="font-bold text-zinc-700 dark:text-zinc-300">{trx.stock.stock_code}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">{trx.lots}</td>
                                                                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">{formatIDR(trx.buy_price)}</td>
                                                                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">{formatIDR(trx.sell_price)}</td>
                                                                        <td className="px-4 py-3 text-right">
                                                                            <span className={`font-bold ${trx.net_profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : trx.net_profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}`}>
                                                                                {trx.net_profit > 0 ? '+' : ''}{formatIDR(trx.net_profit)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: CALENDAR & ACTIVE IPOS */}
                    <div className={`${mobileTab !== 'portfolio' ? 'flex' : 'hidden'} xl:flex flex-col space-y-8 overflow-y-auto xl:pr-4 pb-20 animate-fade-in-up delay-200`}>

                        {/* 5. Custom Tailwind IPO Calendar Widget */}
                        <div className={`${mobileTab === 'calendar' ? 'block' : 'hidden'} xl:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[1.5rem] shadow-sm`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">IPO Calendar</h2>
                                <div className="text-xs font-bold text-gojek-600 dark:text-gojek-400 bg-gojek-50 dark:bg-gojek-900/30 px-3 py-1 rounded-full border border-gojek-100 dark:border-gojek-900/50">July 2026</div>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                    <div key={i} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {(() => {
                                    const year = 2026;
                                    const month = 6; // July
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                    const firstDayOfMonth = new Date(year, month, 1).getDay();
                                    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

                                    const days = [];
                                    for (let i = 0; i < startDay; i++) days.push(null);
                                    for (let i = 1; i <= daysInMonth; i++) days.push(i);

                                    const allEvents = [];
                                    if (ipoCalendar) {
                                        ipoCalendar.forEach(ipo => {
                                            allEvents.push({ type: 'Offering', id: ipo.id, ticker: ipo.title?.split(' | ')[0] || ipo.ticker, start: ipo.start, end: ipo.end, ipo });
                                        });
                                    }
                                    if (ipoDetails) {
                                        Object.values(ipoDetails).forEach(details => {
                                            const ticker = details.ticker;
                                            const ipo = (ipoCalendar || []).find(i => i.title?.includes(ticker) || i.ticker === ticker) || (activeIpos || []).find(i => i.ticker === ticker) || { id: ticker, ticker };

                                            const parseDate = (dStr) => {
                                                if (!dStr) return null;
                                                const m = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
                                                const p = dStr.trim().split(' ');
                                                if (p.length >= 3) return `${p[2]}-${m[p[1]]}-${p[0].padStart(2, '0')}`;
                                                return null;
                                            };

                                            if (details.schedule?.allotment) {
                                                const d = parseDate(details.schedule.allotment);
                                                if (d) allEvents.push({ type: 'Allotment', id: ipo.id, ticker, date: d, ipo, details });
                                            }
                                            if (details.schedule?.distribution) {
                                                const d = parseDate(details.schedule.distribution);
                                                if (d) allEvents.push({ type: 'Distribution', id: ipo.id, ticker, date: d, ipo, details });
                                            }
                                            if (details.schedule?.listing_date) {
                                                const d = parseDate(details.schedule.listing_date);
                                                if (d) allEvents.push({ type: 'Listing', id: ipo.id, ticker, date: d, ipo, details });
                                            }
                                        });
                                    }

                                    return days.map((day, idx) => {
                                        let dayEvents = [];
                                        const eventsByTicker = {};
                                        let dateStr = '';

                                        if (day) {
                                            dateStr = `${year}-07-${day.toString().padStart(2, '0')}`;
                                            dayEvents = allEvents.filter(e => {
                                                if (e.type === 'Offering') return dateStr >= e.start && dateStr <= e.end;
                                                return e.date === dateStr;
                                            });

                                            dayEvents.forEach(e => {
                                                if (!eventsByTicker[e.ticker]) eventsByTicker[e.ticker] = { ipo: e.ipo, details: e.details, events: [] };
                                                eventsByTicker[e.ticker].events.push(e);
                                            });
                                        }

                                        const hasEvents = dayEvents.length > 0;
                                        const uniqueIpos = Object.values(eventsByTicker);
                                        const isWeekend = idx % 7 === 5 || idx % 7 === 6;
                                        const isHoliday = day === 7; // Mock holiday for July 7th 2026 (Tahun Baru Islam)
                                        const isOffDay = isWeekend || isHoliday;

                                        return (
                                            <div key={idx} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative group transition-all ${day ? (hasEvents ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-800 dark:text-white hover:border-gojek-400 dark:hover:border-gojek-600 hover:bg-gojek-50 dark:hover:bg-gojek-900/30 hover:text-gojek-900 dark:hover:text-gojek-100' : (isOffDay ? 'bg-rose-50/50 dark:bg-rose-900/10 text-rose-500 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm' : 'bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm')) : 'bg-transparent'} cursor-pointer`}>
                                                {day && <span className={`text-sm font-semibold mb-0.5 ${isOffDay && !hasEvents ? 'text-rose-500' : isOffDay && hasEvents ? 'text-rose-600 dark:text-rose-400' : ''}`}>{day}</span>}
                                                {day && hasEvents && (
                                                    <div className="flex -space-x-1">
                                                        {uniqueIpos.slice(0, 3).map(({ ipo }) => (
                                                            <img key={ipo.id} src={typeof ipo.id === 'number' ? `https://e-ipo.co.id/id/pipeline/get-logo?id=${ipo.id}` : `https://ui-avatars.com/api/?name=${ipo.ticker?.substring(0, 2)}&background=000&color=fff`} alt="Logo" loading="lazy" className="w-3.5 h-3.5 rounded-full border border-white dark:border-zinc-800 bg-white object-contain shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${ipo.ticker?.substring(0, 2)}&background=000&color=fff`; }} />
                                                        ))}
                                                        {uniqueIpos.length > 3 && <span className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-white dark:border-zinc-800 text-[7px] flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold leading-none shadow-sm">+{uniqueIpos.length - 3}</span>}
                                                    </div>
                                                )}

                                                {/* Tooltip */}
                                                {hasEvents && (
                                                    <div className={`absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all min-w-[14rem] w-max max-w-[18rem] bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white text-left p-3.5 rounded-xl shadow-2xl pointer-events-none border border-zinc-200 dark:border-zinc-800 
                                                        ${Math.floor(idx / 7) >= 4 ? 'bottom-full mb-3' : 'top-full mt-3'} 
                                                        ${idx % 7 < 2 ? 'left-0' : idx % 7 > 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                                                    `}>
                                                        <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-wider px-1">Jul {day} Events</div>
                                                        <div className="space-y-2">
                                                            {uniqueIpos.map(({ ipo, events }) => {
                                                                const ticker = ipo.title?.split(' | ')[0] || ipo.ticker;

                                                                return (
                                                                    <div key={ticker} className="flex items-center space-x-2">
                                                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-px shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                                            <img src={typeof ipo.id === 'number' ? `https://e-ipo.co.id/id/pipeline/get-logo?id=${ipo.id}` : `https://ui-avatars.com/api/?name=${ticker.substring(0, 2)}&background=random&color=fff`} alt="Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${ticker.substring(0, 2)}&background=random&color=fff`; }} />
                                                                        </div>
                                                                        <div className="flex-1 flex items-center justify-between space-x-3">
                                                                            <div className="font-black text-sm text-zinc-700 dark:text-zinc-200 leading-none">{ticker}</div>
                                                                            <div className="flex flex-col items-end space-y-0.5">
                                                                                {events.map((ev, i) => {
                                                                                    if (ev.type === 'Offering' && ev.start === dateStr) return <span key={i} className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Starts Offering</span>;
                                                                                    if (ev.type === 'Offering' && ev.end === dateStr) return <span key={i} className="text-xs font-bold text-rose-600 dark:text-rose-400">Ends Offering</span>;
                                                                                    if (ev.type === 'Offering') return <span key={i} className="text-xs font-bold text-gojek-500">Offering (PU)</span>;

                                                                                    const colorClass = ev.type === 'Listing' ? 'text-rose-600 dark:text-rose-400 font-bold' : ev.type === 'Allotment' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-orange-600 dark:text-orange-400 font-bold';
                                                                                    return <span key={i} className={`text-xs ${colorClass}`}>{ev.type}</span>;
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        <div className={`absolute w-3 h-3 bg-white dark:bg-zinc-900 rotate-45 border-zinc-200 dark:border-zinc-800 
                                                            ${Math.floor(idx / 7) >= 4 ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-l border-t'} 
                                                            ${idx % 7 < 2 ? 'left-8' : idx % 7 > 4 ? 'right-8' : 'left-1/2 -translate-x-1/2'}
                                                        `}></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* 6. Active IPO Offerings Widget */}
                        <div className={`${mobileTab === 'offerings' ? 'block' : 'hidden'} xl:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[1.5rem] shadow-sm`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Lagi Masa Penawaran</h2>
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                            </div>
                            {activeIpos && activeIpos.filter(ipo => ipo.status !== 'Closed').length > 0 ? (
                                <div className="space-y-4">
                                    {activeIpos.filter(ipo => ipo.status !== 'Closed').map((ipo, idx) => {
                                        const ticker = ipo.title?.split(' | ')[0] || ipo.ticker;
                                        const details = ipoDetails && ipoDetails[ticker];

                                        return (
                                            <button key={idx} onClick={(e) => {
                                                if (details) {
                                                    e.preventDefault();
                                                    setSelectedIpoDetails(details);
                                                } else {
                                                    window.open(`https://e-ipo.co.id${ipo.links.more_info}`, '_blank');
                                                }
                                            }} className="group w-full text-left block border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl hover:border-gojek-300 dark:hover:border-gojek-700 hover:bg-gojek-50/50 dark:hover:bg-gojek-900/20 transition-colors bg-white dark:bg-zinc-900 cursor-pointer">
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm border-[3px] border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden group/img">
                                                        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse transition-opacity duration-500 group-[.loaded]/img:opacity-0 pointer-events-none rounded-full"></div>
                                                        <img src={`https://e-ipo.co.id/id/pipeline/get-logo?id=${ipo.id}`} alt={ipo.ticker} className="w-full h-full object-contain rounded-full opacity-0 transition-opacity duration-700 relative z-10" onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.add('loaded'); }} onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_LOGO; e.target.classList.remove('opacity-0'); e.target.parentElement.classList.add('loaded'); }} loading="lazy" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-zinc-800 dark:text-white text-lg group-hover:text-gojek-600 dark:group-hover:text-gojek-400 transition-colors leading-none">{ipo.ticker}</h3>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">{ipo.sector}</p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end justify-center">
                                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Masa Penawaran</span>
                                                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{ipo.offering_period}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 font-medium h-10">{ipo.company_name}</p>

                                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3.5 border border-zinc-100 dark:border-zinc-800 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/50 group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-950/20 transition-colors flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{ipo.price_type}</span>
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xl leading-tight">{ipo.price}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Jumlah Saham</span>
                                                        <span className="font-bold text-zinc-700 dark:text-zinc-300 text-base">{ipo.shares_offered}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Belum ada saham yang lagi IPO nih.</p>
                                </div>
                            )}
                        </div>

                        {/* 7. Album Koleksi IPO Banner */}
                        <div className={`${mobileTab === 'collection' ? 'block' : 'hidden'} xl:block`}>
                            <Link href={route('collection.index')} className="group block relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 dark:hover:border-amber-600/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 dark:from-amber-400/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-6 h-6 text-amber-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100">Album Koleksi</h2>
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Buka buku koleksi lo dan cek kartu-kartu hasil trading IPO lu sekarang! ✨</p>
                                    </div>
                                    <div className="ml-4 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                                        <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </Link>
                        </div>

                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="xl:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe z-40">
                <div className="flex justify-around items-center px-2 py-3">
                    <button
                        onClick={() => setMobileTab('calendar')}
                        className={`flex flex-col items-center justify-center space-y-1 w-[20%] transition-colors ${mobileTab === 'calendar' ? 'text-gojek-600 dark:text-gojek-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'calendar' ? 'bg-gojek-50 dark:bg-gojek-900/30' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={mobileTab === 'calendar' ? '2.5' : '2'}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold ${mobileTab === 'calendar' ? 'text-gojek-600 dark:text-gojek-400' : ''}`}>Kalender</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('portfolio')}
                        className={`flex flex-col items-center justify-center space-y-1 w-[20%] transition-colors ${mobileTab === 'portfolio' ? 'text-gojek-600 dark:text-gojek-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'portfolio' ? 'bg-gojek-50 dark:bg-gojek-900/30' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={mobileTab === 'portfolio' ? '2.5' : '2'}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold ${mobileTab === 'portfolio' ? 'text-gojek-600 dark:text-gojek-400' : ''}`}>Portofolio</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('offerings')}
                        className={`flex flex-col items-center justify-center space-y-1 w-[20%] transition-colors ${mobileTab === 'offerings' ? 'text-gojek-600 dark:text-gojek-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'offerings' ? 'bg-gojek-50 dark:bg-gojek-900/30' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={mobileTab === 'offerings' ? '2.5' : '2'}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold ${mobileTab === 'offerings' ? 'text-gojek-600 dark:text-gojek-400' : ''}`}>Penawaran</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('collection')}
                        className={`flex flex-col items-center justify-center space-y-1 w-[20%] transition-colors ${mobileTab === 'collection' ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${mobileTab === 'collection' ? 'bg-amber-50 dark:bg-amber-900/30' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={mobileTab === 'collection' ? '2.5' : '2'}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold ${mobileTab === 'collection' ? 'text-amber-600 dark:text-amber-400' : ''}`}>Koleksi</span>
                    </button>
                </div>
            </div>

            {/* MODALS */}

            {/* Add SID Modal */}
            <Transition appear show={isSidModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsSidModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-zinc-900 dark:text-white mb-6 text-center">Tambah Akun SID</Dialog.Title>
                                    <form onSubmit={submitSid} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Nama Akun / Alias</label>
                                            <input type="text" value={sidData.sid_name} onChange={e => setSidData('sid_name', e.target.value)} required className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 dark:focus:border-gojek-400 dark:focus:ring-gojek-400 transition-colors px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white" placeholder="e.g. Ajaib Si Anton" />
                                        </div>
                                        <div className="relative z-10">
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Pilih Sekuritas</label>
                                            <Listbox value={sidData.broker_name} onChange={val => setSidData('broker_name', val)}>
                                                <div className="relative mt-1">
                                                    <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 py-3 pl-4 pr-10 text-left border border-zinc-200 dark:border-zinc-700 focus:outline-none focus-visible:border-gojek-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
                                                        <span className="block truncate">{sidData.broker_name ? BROKERS.find(b => b.id === sidData.broker_name)?.name : 'Pilih Sekuritas...'}</span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                            <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-zinc-800 py-2 border dark:border-zinc-700 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            {BROKERS.map((broker, brokerIdx) => (
                                                                <Listbox.Option
                                                                    key={brokerIdx}
                                                                    className={({ active }) =>
                                                                        `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-gojek-50 dark:bg-gojek-900/30 text-gojek-900 dark:text-white' : 'text-zinc-900 dark:text-zinc-300'}`
                                                                    }
                                                                    value={broker.id}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>{broker.name}</span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gojek-600 dark:text-gojek-400">
                                                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                            <button type="button" onClick={() => setIsSidModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                            <button type="submit" disabled={processingSid} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gojek-600 hover:bg-gojek-700 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900 disabled:opacity-50">Simpan Akun</button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Add Transaction Modal */}
            <Transition appear show={isTrxModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsTrxModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-zinc-900 dark:text-white mb-6 text-center">Catat Saham IPO</Dialog.Title>
                                    <form onSubmit={submitTrx} className="space-y-5">
                                        <div className="relative z-20">
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Kode Saham</label>
                                            <Combobox value={trxData.stock_code} onChange={val => {
                                                const activeIpoInfo = activeIpos?.find(ipo => ipo.ticker === val);
                                                const isOffering = activeIpoInfo?.status === 'Offering';

                                                if (isOffering) {
                                                    let ipoPriceStr = activeIpoInfo?.price || '';
                                                    let ipoPriceNum = ipoPriceStr.replace(/[^0-9]/g, '');
                                                    setTrxData({ ...trxData, stock_code: val, ipo_price: ipoPriceNum });
                                                } else {
                                                    setTrxData({ ...trxData, stock_code: val, ipo_price: '' });
                                                    if (val) {
                                                        window.axios.get(`/api/stocks/${val}/live-price`)
                                                            .then(res => {
                                                                if (res.data.price) {
                                                                    setTrxData(prev => ({ ...prev, ipo_price: res.data.price }));
                                                                }
                                                            })
                                                            .catch(err => console.error('Gagal fetch harga live', err));
                                                    }
                                                }
                                            }}>
                                                <div className="relative mt-1">
                                                    <div className="relative w-full cursor-default overflow-hidden rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 text-left border border-zinc-200 dark:border-zinc-700 focus-within:border-gojek-500 focus-within:ring-1 focus-within:ring-gojek-500 transition-colors sm:text-sm">
                                                        <Combobox.Input
                                                            className="w-full border-none py-3 pl-4 pr-10 text-sm font-bold uppercase tracking-widest text-gojek-900 dark:text-gojek-100 bg-transparent focus:ring-0 placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-zinc-400"
                                                            placeholder="Cari kode saham (misal: BREN)"
                                                            displayValue={(stock) => stock}
                                                            onChange={(event) => setStockQuery(event.target.value)}
                                                        />
                                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                            <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </Combobox.Button>
                                                    </div>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setStockQuery('')}>
                                                        <Combobox.Options className="absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-zinc-800 py-2 border dark:border-zinc-700 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            {filteredStocks.length === 0 && stockQuery !== '' ? (
                                                                <div className="relative cursor-default select-none py-3 px-4 text-zinc-700 dark:text-zinc-300">Nggak nemu sahamnya nih.</div>
                                                            ) : (
                                                                filteredStocks.map((stock) => (
                                                                    <Combobox.Option
                                                                        key={stock}
                                                                        className={({ active }) =>
                                                                            `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-gojek-50 dark:bg-gojek-900/30' : ''}`
                                                                        }
                                                                        value={stock}
                                                                    >
                                                                        {({ selected, active }) => {
                                                                            const activeIpoInfo = activeIpos?.find(ipo => ipo.ticker === stock);
                                                                            const isOffering = activeIpoInfo?.status === 'Offering';
                                                                            const isClosedIpo = activeIpoInfo?.status === 'Closed';

                                                                            return (
                                                                                <>
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'} ${isOffering ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{stock}</span>
                                                                                        {isOffering ? (
                                                                                            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">Lagi IPO</span>
                                                                                        ) : isClosedIpo ? (
                                                                                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider">IPO Tutup</span>
                                                                                        ) : (
                                                                                            <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider">Saham Biasa</span>
                                                                                        )}
                                                                                    </div>
                                                                                    {selected ? (
                                                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-gojek-600 dark:text-gojek-400`}>
                                                                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                                                        </span>
                                                                                    ) : null}
                                                                                </>
                                                                            )
                                                                        }}
                                                                    </Combobox.Option>
                                                                ))
                                                            )}
                                                        </Combobox.Options>
                                                    </Transition>
                                                </div>
                                            </Combobox>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Harga Beli (Rp)</label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-zinc-500 dark:text-zinc-400 sm:text-sm font-medium">Rp</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        value={trxData.ipo_price} 
                                                        onChange={e => setTrxData('ipo_price', e.target.value)} 
                                                        required 
                                                        readOnly={activeIpos?.find(ipo => ipo.ticker === trxData.stock_code)?.status === 'Offering'} 
                                                        className={`w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors pl-9 pr-3 py-3 font-semibold shadow-inner ${activeIpos?.find(ipo => ipo.ticker === trxData.stock_code)?.status === 'Offering' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed' : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white cursor-text'}`} 
                                                        placeholder={activeIpos?.find(ipo => ipo.ticker === trxData.stock_code)?.status === 'Offering' ? "Otomatis" : "Misal: 500"} 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Dapat Berapa Lot?</label>
                                                <div className="relative">
                                                    <input type="number" min="1" value={trxData.lots} onChange={e => setTrxData('lots', e.target.value)} required className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors pl-4 pr-12 py-3 bg-zinc-50/50 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-white" placeholder="10" />
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <span className="text-zinc-400 dark:text-zinc-500 sm:text-sm font-bold">Lot</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                            <button type="button" onClick={() => setIsTrxModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                            <button type="submit" disabled={processingTrx} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gojek-600 hover:bg-gojek-700 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900 disabled:opacity-50">Simpan Transaksi</button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Edit Price Modal */}
            <Transition appear show={isPriceModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsPriceModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-extrabold leading-6 text-zinc-900 dark:text-white text-center mb-6">Update Harga</Dialog.Title>
                                    <form onSubmit={submitPriceUpdate} className="space-y-6">
                                        {(() => {
                                            const getAraArbStatus = (base, current) => {
                                                if (!base || !current || base === current) return null;
                                                let p = base;
                                                for (let i = 1; i <= 10; i++) {
                                                    let pct = p > 5000 ? 0.20 : (p > 200 ? 0.25 : 0.35);
                                                    p = Math.round(p * (1 + pct));
                                                    if (p === current) return { type: 'ARA', count: i, percent: ((current - base) / base * 100).toFixed(1) };
                                                }
                                                p = base;
                                                for (let i = 1; i <= 10; i++) {
                                                    let pct = p > 5000 ? 0.20 : (p > 200 ? 0.25 : 0.35);
                                                    p = Math.round(p * (1 - pct));
                                                    if (p === current) return { type: 'ARB', count: i, percent: ((current - base) / base * 100).toFixed(1) };
                                                }
                                                return null;
                                            };
                                            const araArbStatus = getAraArbStatus(parseInt(priceData.base_price), parseInt(priceData.price));
                                            return (
                                                <div>
                                                    <div className="relative rounded-2xl shadow-sm">
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                            <span className="text-zinc-500 dark:text-zinc-400 sm:text-lg font-bold">Rp</span>
                                                        </div>
                                                        <input type="number" min="0" value={priceData.price} onChange={e => setPriceData({ ...priceData, price: e.target.value })} className="block w-full rounded-2xl border-zinc-200 dark:border-zinc-700 pl-14 pr-4 py-4 text-2xl font-black text-center focus:border-gojek-500 focus:ring-gojek-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-inner transition-colors" placeholder="0" />
                                                    </div>
                                                    {araArbStatus && (
                                                        <div className={`mt-3 text-center text-xs font-black uppercase tracking-wider ${araArbStatus.type === 'ARA' ? 'text-gojek-600 dark:text-gojek-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                            🔥 Mentok {araArbStatus.type} {araArbStatus.count}x ({araArbStatus.percent > 0 ? '+' : ''}{araArbStatus.percent}%)
                                                        </div>
                                                    )}
                                                    <div className="flex justify-center space-x-3 mt-4">
                                                        <button type="button" onClick={() => {
                                                            const prevPrice = parseInt(priceData.price || priceData.base_price || 0);
                                                            if (!prevPrice) return;
                                                            let percentage = prevPrice > 5000 ? 0.20 : (prevPrice > 200 ? 0.25 : 0.35);
                                                            setPriceData({ ...priceData, price: Math.round(prevPrice * (1 - percentage)) });
                                                        }} className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors shadow-sm">
                                                            - ARB
                                                        </button>
                                                        <button type="button" onClick={() => {
                                                            const prevPrice = parseInt(priceData.price || priceData.base_price || 0);
                                                            if (!prevPrice) return;
                                                            let percentage = prevPrice > 5000 ? 0.20 : (prevPrice > 200 ? 0.25 : 0.35);
                                                            setPriceData({ ...priceData, price: Math.round(prevPrice * (1 + percentage)) });
                                                        }} className="px-4 py-2 bg-gojek-100 dark:bg-gojek-900/30 text-gojek-700 dark:text-gojek-400 text-xs font-bold rounded-xl hover:bg-gojek-200 dark:hover:bg-gojek-900/50 transition-colors shadow-sm">
                                                            + ARA
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                            <button type="button" onClick={() => setIsPriceModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gojek-600 hover:bg-gojek-700 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900">Simpan</button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete SID Modal */}
            <Transition appear show={isDeleteSidModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteSidModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 mb-4">
                                        <svg className="h-8 w-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-extrabold leading-6 text-zinc-900 dark:text-white text-center mb-2">Hapus SID?</Dialog.Title>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">Yakin mau hapus <strong className="text-zinc-900 dark:text-white">{targetSid?.sid_name}</strong>? Semua saham yang ada di dalam SID ini juga bakal ikut kehapus permanen loh.</p>
                                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                        <button type="button" onClick={() => setIsDeleteSidModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                        <button type="button" onClick={submitDeleteSid} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/50">Ya, Hapus Aja</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Edit SID Modal */}
            <Transition appear show={isEditSidModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsEditSidModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-zinc-900 dark:text-white mb-6 text-center">Edit Akun SID</Dialog.Title>
                                    <form onSubmit={submitEditSid} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Nama Akun / Alias</label>
                                            <input type="text" value={editSidData.sid_name} onChange={e => setEditSidData('sid_name', e.target.value)} required className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 dark:focus:border-gojek-400 dark:focus:ring-gojek-400 transition-colors px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Pilih Sekuritas</label>
                                            <Listbox value={editSidData.broker_name} onChange={val => setEditSidData('broker_name', val)}>
                                                <div className="relative mt-1">
                                                    <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 py-3 pl-4 pr-10 text-left border border-zinc-200 dark:border-zinc-700 focus:outline-none focus-visible:border-gojek-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
                                                        <span className="block truncate">{editSidData.broker_name ? BROKERS.find(b => b.id === editSidData.broker_name)?.name || editSidData.broker_name : 'Pilih Sekuritas...'}</span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                            <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-[100] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-zinc-800 py-2 border dark:border-zinc-700 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                            {BROKERS.map((broker, brokerIdx) => (
                                                                <Listbox.Option
                                                                    key={brokerIdx}
                                                                    className={({ active }) =>
                                                                        `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${active ? 'bg-gojek-50 dark:bg-gojek-900/30 text-gojek-900 dark:text-white' : 'text-zinc-900 dark:text-zinc-300'}`
                                                                    }
                                                                    value={broker.id}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>{broker.name}</span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gojek-600 dark:text-gojek-400">
                                                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                            <button type="button" onClick={() => setIsEditSidModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                            <button type="submit" disabled={processingEditSid} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gojek-600 hover:bg-gojek-700 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900 disabled:opacity-50">Simpan Perubahan</button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Transaction Modal */}
            <Transition appear show={isDeleteTrxModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteTrxModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 mb-4">
                                        <svg className="h-8 w-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-extrabold leading-6 text-zinc-900 dark:text-white text-center mb-2">Hapus Saham?</Dialog.Title>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">Yakin mau hapus saham <strong className="text-zinc-900 dark:text-white">{targetTrx?.stock?.stock_code}</strong> dari SID ini?</p>
                                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                        <button type="button" onClick={() => setIsDeleteTrxModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                        <button type="button" onClick={submitDeleteTrx} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/50">Ya, Hapus Aja</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Edit Transaction Modal */}
            <Transition appear show={isEditTrxModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsEditTrxModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-zinc-900 dark:text-white mb-6 text-center">Edit Saham {targetTrx?.stock?.stock_code}</Dialog.Title>
                                    <form onSubmit={submitEditTrx} className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Harga Beli (Rp)</label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-zinc-500 dark:text-zinc-400 sm:text-sm font-medium">Rp</span>
                                                    </div>
                                                    <input type="number" value={editTrxData.ipo_price} onChange={e => setEditTrxData('ipo_price', e.target.value)} required className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors pl-9 pr-3 py-3 bg-zinc-50/50 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Dapat Berapa Lot?</label>
                                                <div className="relative">
                                                    <input type="number" min="1" value={editTrxData.lots} onChange={e => setEditTrxData('lots', e.target.value)} required className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors pl-4 pr-12 py-3 bg-zinc-50/50 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-white" />
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <span className="text-zinc-400 dark:text-zinc-500 sm:text-sm font-bold">Lot</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                            <button type="button" onClick={() => setIsEditTrxModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Batal</button>
                                            <button type="submit" disabled={processingEditTrx} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gojek-600 hover:bg-gojek-700 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900 disabled:opacity-50">Simpan Perubahan</button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Smart Averaging Calculator Modal */}
            <Transition appear show={isAvgCalcOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsAvgCalcOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-100 dark:border-zinc-800">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gojek-50 dark:bg-gojek-900/30 mb-4">
                                        <svg className="h-8 w-8 text-gojek-600 dark:text-gojek-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-2xl font-black leading-6 text-zinc-900 dark:text-white mb-2 text-center">Kalkulator Rata-rata</Dialog.Title>
                                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-6">Biar nggak pusing, hitung average harga buat saham {avgCalcData.trx?.stock?.stock_code} kamu.</p>

                                    <div className="space-y-4">
                                        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase">Average Saat Ini</p>
                                                <p className="text-lg font-black text-stone-800 dark:text-white">{formatIDR(avgCalcData.trx?.buy_price || 0)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase">Total Lot Saat Ini</p>
                                                <p className="text-lg font-black text-stone-800 dark:text-white">{avgCalcData.trx?.lots || 0}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase">Mau Tambah Berapa Lot?</label>
                                                <input type="number" min="1" value={avgCalcData.additionalLots} onChange={e => setAvgCalcData({ ...avgCalcData, additionalLots: e.target.value })} className="w-full rounded-xl border-stone-200 dark:border-stone-800 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-stone-950 font-bold text-stone-900 dark:text-white px-4 py-3 tabular-nums" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase">Target Harga Beli</label>
                                                <input type="number" min="1" value={avgCalcData.newPrice} onChange={e => setAvgCalcData({ ...avgCalcData, newPrice: e.target.value })} className="w-full rounded-xl border-stone-200 dark:border-stone-800 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-stone-950 font-bold text-stone-900 dark:text-white px-4 py-3 tabular-nums" placeholder="Rp" />
                                            </div>
                                        </div>

                                        {calculateAvgDown() && (
                                            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Average Baru Kamu</span>
                                                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{formatIDR(calculateAvgDown().newAvgPrice)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500 uppercase">Modal Tambahan</span>
                                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-500 tabular-nums">{formatIDR(calculateAvgDown().totalNewCapital)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-8">
                                            <button type="button" onClick={() => setIsAvgCalcOpen(false)} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 transition-colors">Tutup Kalkulator</button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Custom CSS for blob animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                .delay-100 {
                    animation-delay: 100ms;
                }
                .delay-200 {
                    animation-delay: 200ms;
                }
                .delay-300 {
                    animation-delay: 300ms;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #d6d3d1;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #a8a29e;
                }
                .dark ::-webkit-scrollbar-thumb {
                    background: #44403c;
                }
                .dark ::-webkit-scrollbar-thumb:hover {
                    background: #57534e;
                }
            `}} />

            {/* Toast Notifications */}
            {typeof window !== 'undefined' && createPortal(
                <div className="fixed top-5 right-5 z-[10000] flex flex-col space-y-3 pointer-events-none">
                    <Transition
                        show={toast.show && toast.type === 'success'}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-x-full opacity-0"
                        enterTo="translate-x-0 opacity-100"
                        leave="transition ease-in duration-200"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="translate-x-full opacity-0"
                    >
                        <div className="w-80 sm:w-[26rem] bg-white/70 dark:bg-zinc-800/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[1.25rem] pointer-events-auto border border-white/60 dark:border-zinc-700/50 overflow-hidden group transition-all hover:bg-white/90 dark:hover:bg-zinc-800/90">
                            <div className="p-4 flex items-start gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Berhasil!</p>
                                    <p className="mt-0.5 text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{toast.message}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={() => setToast({ show: false, message: '', type: '' })}
                                    >
                                        <span className="sr-only">Tutup</span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>

                    <Transition
                        show={toast.show && toast.type === 'error'}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-x-full opacity-0"
                        enterTo="translate-x-0 opacity-100"
                        leave="transition ease-in duration-200"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="translate-x-full opacity-0"
                    >
                        <div className="w-80 sm:w-[26rem] bg-white/70 dark:bg-zinc-800/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-[1.25rem] pointer-events-auto border border-white/60 dark:border-zinc-700/50 overflow-hidden group transition-all hover:bg-white/90 dark:hover:bg-zinc-800/90">
                            <div className="p-4 flex items-start gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-[15px] font-bold text-zinc-900 dark:text-white">Ada Masalah</p>
                                    <p className="mt-0.5 text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{toast.message}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={() => setToast({ show: false, message: '', type: '' })}
                                    >
                                        <span className="sr-only">Tutup</span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>,
                document.body
            )}

            {/* IPO Details Modal */}
            <Transition appear show={selectedIpoDetails !== null} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setSelectedIpoDetails(null)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-0 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    {selectedIpoDetails && (
                                        <div className="max-h-[85vh] flex flex-col">
                                            {/* Header */}
                                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-20 h-20 bg-white rounded-full shadow-md border-4 border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden group/modalimg">
                                                        <div className="absolute inset-0 bg-zinc-100 animate-pulse transition-opacity duration-500 group-[.loaded]/modalimg:opacity-0 pointer-events-none rounded-full"></div>
                                                        <img src={`https://e-ipo.co.id${selectedIpoDetails.links?.logo}`} alt={selectedIpoDetails.ticker} className="w-full h-full object-contain rounded-full opacity-0 transition-opacity duration-700 relative z-10" onLoad={(e) => { e.target.classList.remove('opacity-0'); e.target.parentElement.classList.add('loaded'); }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${selectedIpoDetails.ticker}&background=random&color=fff`; e.target.classList.remove('opacity-0'); e.target.parentElement.classList.add('loaded'); }} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{selectedIpoDetails.ticker}</h3>
                                                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-emerald-200 dark:border-emerald-800">{selectedIpoDetails.status}</span>
                                                            {selectedIpoDetails.is_syariah && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-green-200 dark:border-green-800">Syariah</span>}
                                                        </div>
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 font-bold mb-1">{selectedIpoDetails.company_name}</p>
                                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">{selectedIpoDetails.sector} • {selectedIpoDetails.subsector}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => setSelectedIpoDetails(null)} className="p-3 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors ml-2">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Scrollable Content */}
                                            <div className="p-6 overflow-y-auto space-y-8 bg-white dark:bg-zinc-950">

                                                {/* Highlights */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gojek-50 dark:bg-gojek-900/10 border border-gojek-100 dark:border-gojek-900/30 p-4 rounded-xl">
                                                        <span className="text-[10px] text-gojek-500 font-bold uppercase tracking-wider block mb-1">Jumlah Saham</span>
                                                        <span className="text-lg font-black text-gojek-700 dark:text-gojek-400">{selectedIpoDetails.offering_details?.total_shares_offered}</span>
                                                        <div className="text-xs text-gojek-600 dark:text-gojek-500 mt-1">{selectedIpoDetails.offering_details?.percentage_of_total_listed_shares}% dari total saham</div>
                                                    </div>
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Harga Final</span>
                                                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{selectedIpoDetails.schedule?.public_offering?.price}</span>
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Kisaran: {selectedIpoDetails.schedule?.book_building?.price_range}</div>
                                                    </div>
                                                </div>

                                                {/* Schedule Timeline */}
                                                {/* IPO Lifecycle Pipeline & Countdown Timer */}
                                                <div>
                                                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-6">
                                                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Jadwal IPO-nya Nih</h4>
                                                    </div>

                                                    {!countdown.isPast && selectedIpoDetails.schedule?.listing_date && (
                                                        <div className="mb-8 p-6 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gojek-200/40 via-zinc-100/0 to-zinc-100/0 dark:from-gojek-900/40 dark:via-zinc-900/0 dark:to-zinc-900/0"></div>
                                                            <div className="relative z-10 flex flex-col items-center">
                                                                <h5 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Berapa Lama Lagi Listing?</h5>
                                                                <div className="flex space-x-4">
                                                                    {[
                                                                        { label: 'Hari', value: countdown.days },
                                                                        { label: 'Jam', value: countdown.hours },
                                                                        { label: 'Menit', value: countdown.minutes },
                                                                        { label: 'Detik', value: countdown.seconds }
                                                                    ].map((time, idx) => (
                                                                        <div key={idx} className="flex flex-col items-center">
                                                                            <div className="w-16 h-16 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center mb-2 shadow-inner">
                                                                                <span className="text-2xl font-black text-zinc-800 dark:text-white tabular-nums">{time.value.toString().padStart(2, '0')}</span>
                                                                            </div>
                                                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{time.label}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="relative">
                                                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-zinc-200 dark:bg-zinc-700"></div>
                                                        <div className="space-y-6">
                                                            {[
                                                                { title: 'Masa Penawaran Awal', date: selectedIpoDetails.schedule?.book_building?.period, color: 'text-zinc-400 dark:text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', active: false },
                                                                { title: 'Penawaran Umum', date: selectedIpoDetails.schedule?.public_offering?.period, color: 'text-gojek-500', bg: 'bg-gojek-100 dark:bg-gojek-900', active: selectedIpoDetails.status === 'Offering' },
                                                                { title: 'Penjatahan', date: selectedIpoDetails.schedule?.allotment, color: 'text-zinc-400 dark:text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', active: false },
                                                                { title: 'Distribusi', date: selectedIpoDetails.schedule?.distribution, color: 'text-zinc-400 dark:text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', active: false },
                                                                { title: 'Tanggal Listing', date: selectedIpoDetails.schedule?.listing_date, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900', active: false }
                                                            ].filter(step => step.date).map((step, idx) => (
                                                                <div key={idx} className="relative flex items-center gap-6 z-10">
                                                                    <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950 ${step.active ? 'bg-gojek-500 text-white shadow-lg shadow-gojek-200 dark:shadow-gojek-900' : step.bg + ' ' + step.color}`}>
                                                                        {step.active ? (
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        ) : (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                                                                        )}
                                                                    </div>
                                                                    <div className={`flex-1 ${step.active ? 'bg-gojek-50 dark:bg-gojek-900/20 border border-gojek-100 dark:border-gojek-900/50' : 'bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'} p-4 rounded-2xl transition-colors`}>
                                                                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${step.active ? 'text-gojek-600 dark:text-gojek-400' : 'text-zinc-400 dark:text-zinc-500'}`}>{step.title}</div>
                                                                        <div className={`text-sm ${step.active ? 'font-black text-gojek-900 dark:text-gojek-100' : 'font-bold text-zinc-700 dark:text-zinc-300'}`}>{step.date}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Underwriters */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">Siapa Saja Sekuritasnya?</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {selectedIpoDetails.offering_details?.underwriters?.map((u, i) => {
                                                            const brokerCode = u.split(' - ')[0];
                                                            const brokerName = u.split(' - ')[1] || u;
                                                            const stats = getMockUwStats(brokerName);
                                                            return (
                                                                <div key={i} className="group relative flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 cursor-help hover:bg-white dark:hover:bg-zinc-900 hover:border-gojek-200 dark:hover:border-gojek-800 transition-colors">
                                                                    <div className="w-10 h-8 rounded bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-400 group-hover:text-gojek-600 dark:group-hover:text-gojek-400 transition-colors">{brokerCode}</div>
                                                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{brokerName}</span>

                                                                    {/* Underwriter Stats Tooltip */}
                                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 z-10">
                                                                        <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl shadow-xl p-4 border border-zinc-200 dark:border-zinc-700">
                                                                            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">Rekam Jejak (Contoh)</div>
                                                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                                                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                                                                    <div className="text-xl font-black text-emerald-500 dark:text-emerald-400">{stats.ara}</div>
                                                                                    <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">ARA</div>
                                                                                </div>
                                                                                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                                                                    <div className="text-xl font-black text-rose-500 dark:text-rose-400">{stats.arb}</div>
                                                                                    <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">ARB</div>
                                                                                </div>
                                                                                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                                                                    <div className="text-xl font-black text-zinc-700 dark:text-zinc-300">{stats.stable}</div>
                                                                                    <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Stabil</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 italic text-center">Ini dari {stats.total} IPO terakhir yang mereka kawal.</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Company Profile */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">Profil Perusahaan</h4>
                                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800 space-y-4">
                                                        <div>
                                                            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Bidang Usaha</div>
                                                            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{selectedIpoDetails.business_field}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5">Ringkasan Singkat</div>
                                                            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
                                                                {selectedIpoDetails.company_summary?.map((p, i) => (
                                                                    <p key={i}>{p}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-2">
                                                            <div className="flex items-start space-x-2">
                                                                <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line">{selectedIpoDetails.address}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                                <a href={selectedIpoDetails.website} target="_blank" rel="noreferrer" className="text-xs text-gojek-500 hover:text-gojek-700 dark:hover:text-gojek-400 hover:underline">{selectedIpoDetails.website}</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Footer Actions */}
                                            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0 flex flex-col sm:flex-row sm:justify-end gap-3 rounded-b-[2rem]">
                                                <a href={`https://e-ipo.co.id${selectedIpoDetails.links?.prospectus_summary}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto flex justify-center items-center px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm shadow-zinc-200/50 dark:shadow-none">
                                                    Prospektus Ringkas
                                                </a>
                                                <a href={`https://e-ipo.co.id${selectedIpoDetails.links?.order_page}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto flex justify-center items-center px-5 py-2.5 bg-gojek-600 dark:bg-gojek-500 text-white rounded-xl text-sm font-bold hover:bg-gojek-700 dark:hover:bg-gojek-600 transition-colors shadow-lg shadow-gojek-200 dark:shadow-gojek-900/50 space-x-2">
                                                    <span>Pesan di e-IPO</span>
                                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Sell Modal */}
            <Transition appear show={isSellModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsSellModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <Dialog.Title as="h3" className="text-xl font-black leading-6 text-zinc-900 dark:text-white mb-6">
                                        Jual Saham <span className="text-emerald-500">{targetSellTrx?.stock?.stock_code}</span>
                                    </Dialog.Title>
                                    <form onSubmit={submitSell} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Harga Jual</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <span className="text-zinc-500 font-bold">Rp</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={sellData.sell_price}
                                                    onChange={e => setSellData('sell_price', e.target.value)}
                                                    required
                                                    min="0"
                                                    className="w-full pl-12 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 py-3 font-semibold"
                                                />
                                            </div>
                                            {sellErrors.sell_price && <p className="mt-2 text-sm text-rose-600">{sellErrors.sell_price}</p>}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Jumlah Lot</label>
                                                <span className="text-xs text-zinc-500">Maks: {targetSellTrx?.lots} Lot</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={sellData.lots}
                                                onChange={e => setSellData('lots', e.target.value)}
                                                required
                                                min="1"
                                                max={targetSellTrx?.lots}
                                                className="w-full rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 py-3 font-semibold"
                                            />
                                            {sellErrors.lots && <p className="mt-2 text-sm text-rose-600">{sellErrors.lots}</p>}
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Estimasi Cuan:</span>
                                                <span className={`font-bold ${((sellData.sell_price || 0) - (targetSellTrx?.buy_price || 0)) * (sellData.lots || 0) * 100 > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {formatIDR(((sellData.sell_price || 0) - (targetSellTrx?.buy_price || 0)) * (sellData.lots || 0) * 100)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex space-x-3">
                                            <button type="button" onClick={() => setIsSellModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Batal</button>
                                            <button type="submit" disabled={processingSell} className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex justify-center items-center">
                                                {processingSell ? 'Memproses...' : 'Jual Saham'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Tier Info Modal */}
            <Transition appear show={isTierModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsTierModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <Dialog.Title as="h3" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                                            Pangkat Bandar Lu
                                        </Dialog.Title>
                                        <button onClick={() => setIsTierModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${currentTier.bg} border-4 border-white dark:border-zinc-800 flex items-center justify-center mb-3 sm:mb-4 shadow-xl`}>
                                            <span className={`${currentTier.color} scale-125 sm:scale-150`}>{currentTier.icon}</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs sm:text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Pangkat Saat Ini</div>
                                            <div className={`text-3xl font-black ${currentTier.color}`}>{currentTier.name}</div>
                                            <div className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300 mt-1 sm:mt-2">
                                                Cuan Sejati: {formatIDR(totalGlobalNetProfit)}
                                            </div>
                                        </div>
                                    </div>

                                    {currentTier.next && (
                                        <div className="mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className="text-zinc-500">Progress ke {currentTier.nextName}</span>
                                                <span className="text-zinc-900 dark:text-white">{Math.min(Math.round(((totalGlobalNetProfit - currentTier.min) / (currentTier.next - currentTier.min)) * 100), 100)}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 mb-2 overflow-hidden">
                                                <div className={`h-2.5 rounded-full ${currentTier.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${Math.min(((totalGlobalNetProfit - currentTier.min) / (currentTier.next - currentTier.min)) * 100, 100)}%` }}></div>
                                            </div>
                                            <p className="text-xs text-center font-semibold text-zinc-500 mt-2">Butuh {formatIDR(currentTier.next - totalGlobalNetProfit)} lagi buat naik pangkat!</p>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Daftar Kepangkatan</div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {[
                                                { name: 'Kuli Pasar', desc: 'Belum ngerasain cuan', color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-3-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2.88 5.76a.75.75 0 0 0-1.24 0A4.996 4.996 0 0 0 12 17a4.996 4.996 0 0 0-1.88-2.24.75.75 0 0 0-1.24.01" clipRule="evenodd" /></svg> },
                                                { name: 'Pedagang Asongan', desc: 'Cuan s/d Rp 500k', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V6zm-1.5 5a1.5 1.5 0 011.5-1.5h18a1.5 1.5 0 011.5 1.5v7a3 3 0 01-3 3H4.5a3 3 0 01-3-3v-7zm7.5 1a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z" clipRule="evenodd" /></svg> },
                                                { name: 'Juragan ARA', desc: 'Cuan s/d Rp 2 Juta', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5v16.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 0-1.5H3.75V3.75a.75.75 0 0 0-.75-.75Zm5.213 11.287 4.5-4.5 2.53 2.53a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06l-4.47 4.47-2.53-2.53a.75.75 0 0 0-1.06 0l-5 5a.75.75 0 0 0 1.06 1.06Z" clipRule="evenodd" /></svg> },
                                                { name: 'Bandar Cilik', desc: 'Cuan s/d Rp 10 Juta', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.36-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v.149c1-.1 2-.17 3-.205v-.149c0-.828-.672-1.5-1.5-1.5z" clipRule="evenodd" /><path d="M2.25 13.918c1.385.498 2.864.876 4.412 1.121A26.177 26.177 0 0012 17.25a26.177 26.177 0 005.338-.561 24.73 24.73 0 004.412-1.121v3.918c0 1.434-1.022 2.7-2.476 2.917A48.796 48.796 0 0112 22.5c-2.43 0-4.817-.178-7.152-.52-1.454-.218-2.476-1.483-2.476-2.917v-3.918z" /></svg> },
                                                { name: 'Anak Sultan', desc: 'Cuan > Rp 10 Juta', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg> }
                                            ].map((tier, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border ${currentTier.name === tier.name ? 'border-gojek-500 bg-gojek-50 dark:bg-gojek-900/20 shadow-sm shadow-gojek-500/10' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'}`}>
                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${tier.bg} flex items-center justify-center ${tier.color}`}>
                                                            {tier.icon}
                                                        </div>
                                                        <div>
                                                            <div className={`text-base font-bold ${currentTier.name === tier.name ? 'text-gojek-600 dark:text-gojek-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{tier.name}</div>
                                                            <div className="text-xs text-zinc-500 font-medium leading-none mt-0.5">{tier.desc}</div>
                                                        </div>
                                                    </div>
                                                    {currentTier.name === tier.name && (
                                                        <div className="text-[10px] font-black text-gojek-500 bg-gojek-100 dark:bg-gojek-900 px-2 py-1 rounded-md shrink-0">YOU</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            <FeedbackWidget />
        </div>
    );
}
