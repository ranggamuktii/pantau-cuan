import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function Toast() {
    const { flash } = usePage().props;
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setShow(true);
            const timer = setTimeout(() => setShow(false), 4000);
            return () => clearTimeout(timer);
        } else if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setShow(true);
            const timer = setTimeout(() => setShow(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 sm:px-0 pointer-events-none">
            <Transition
                show={show}
                enter="transition ease-out duration-300 transform"
                enterFrom="-translate-y-4 opacity-0 scale-95"
                enterTo="translate-y-0 opacity-100 scale-100"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-y-0 opacity-100 scale-100"
                leaveTo="-translate-y-4 opacity-0 scale-95"
            >
                <div className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center space-x-3 backdrop-blur-md ${
                    type === 'success' 
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/20' 
                        : 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 shadow-rose-500/20'
                }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        type === 'success' ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-800/50 text-rose-600 dark:text-rose-400'
                    }`}>
                        {type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 font-bold text-sm leading-tight">
                        {message}
                    </div>
                    <button 
                        onClick={() => setShow(false)}
                        className={`p-1.5 rounded-lg transition-colors ${
                            type === 'success' ? 'hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-emerald-500' : 'hover:bg-rose-100 dark:hover:bg-rose-800/50 text-rose-500'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </Transition>
        </div>
    );
}
