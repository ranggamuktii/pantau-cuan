import React, { useState, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

const categories = [
    { id: 'Bug', name: 'Ada Bug / Error nih', icon: <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { id: 'Feature', name: 'Saran Fitur Baru', icon: <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'Question', name: 'Tanya dong', icon: <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
];

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        category: 'Bug',
        message: '',
    });

    const closeModal = () => {
        setIsOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('feedbacks.store'), {
            onSuccess: () => {
                setTimeout(() => {
                    closeModal();
                }, 2000);
            },
        });
    };

    const selectedCategory = categories.find(c => c.id === data.category) || categories[0];

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gojek-500 text-white shadow-lg hover:bg-gojek-600 hover:scale-110 transition-all focus:outline-none focus:ring-4 focus:ring-gojek-500/30"
                    title="Lapor Bug atau Kasih Masukan"
                >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            </div>

            {/* Feedback Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex justify-between items-start mb-6">
                                        <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-zinc-900 dark:text-white">
                                            Lapor Bug / Ide
                                        </Dialog.Title>
                                        <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors">
                                            <span className="sr-only">Close</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>

                                    {recentlySuccessful ? (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl mb-4 text-center font-medium flex items-center justify-center space-x-2">
                                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>Mantap! Laporan lo udah diterima. Thanks ya!</span>
                                        </div>
                                    ) : (
                                        <form onSubmit={submit} className="space-y-5">
                                            <div className="relative z-20">
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Kategori</label>
                                                <Listbox value={data.category} onChange={(val) => setData('category', val)}>
                                                    <div className="relative mt-1">
                                                        <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-white dark:bg-zinc-900 py-3 pl-4 pr-10 text-left border border-zinc-200 dark:border-zinc-700 focus:outline-none focus-visible:border-gojek-500 focus-visible:ring-2 focus-visible:ring-gojek-500 shadow-sm transition-colors sm:text-sm font-semibold text-zinc-900 dark:text-white">
                                                            <span className="flex items-center space-x-3">
                                                                {selectedCategory.icon}
                                                                <span className="block truncate">{selectedCategory.name}</span>
                                                            </span>
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                            <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white dark:bg-zinc-900 py-2 text-base shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none sm:text-sm z-50 border border-zinc-100 dark:border-zinc-800">
                                                                {categories.map((category) => (
                                                                    <Listbox.Option
                                                                        key={category.id}
                                                                        className={({ active }) =>
                                                                            `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${
                                                                                active ? 'bg-gojek-50 dark:bg-gojek-900/30 text-gojek-900 dark:text-gojek-100' : 'text-zinc-900 dark:text-zinc-100'
                                                                            }`
                                                                        }
                                                                        value={category.id}
                                                                    >
                                                                        {({ selected, active }) => (
                                                                            <>
                                                                                <span className={`flex items-center space-x-3 ${selected ? 'font-bold' : 'font-medium'}`}>
                                                                                    {category.icon}
                                                                                    <span className="block truncate">{category.name}</span>
                                                                                </span>
                                                                                {selected ? (
                                                                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-gojek-600 dark:text-gojek-400' : 'text-gojek-600 dark:text-gojek-500'}`}>
                                                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
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
                                                {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                                            </div>

                                            <div className="relative z-10">
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Pesan Lo</label>
                                                <textarea
                                                    rows={4}
                                                    value={data.message}
                                                    onChange={e => setData('message', e.target.value)}
                                                    required
                                                    placeholder={data.category === 'Bug' ? 'Gimana errornya? Ceritain dong...' : 'Ada ide apa nih buat aplikasi ini?'}
                                                    className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white py-3 px-4 font-medium shadow-sm resize-none"
                                                />
                                                {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
                                            </div>

                                            <div className="pt-2 relative z-10">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-gojek-500 hover:bg-gojek-600 focus:outline-none focus:ring-4 focus:ring-gojek-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span>{processing ? 'Nirim Laporan...' : 'Kirim Sekarang'}</span>
                                                    {!processing && (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
