import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
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
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl mb-4 text-center font-medium">
                                            Mantap! Laporan lo udah diterima. Thanks ya! 🙏
                                        </div>
                                    ) : (
                                        <form onSubmit={submit} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Kategori</label>
                                                <select
                                                    value={data.category}
                                                    onChange={e => setData('category', e.target.value)}
                                                    className="w-full rounded-2xl border-zinc-200 dark:border-zinc-700 focus:border-gojek-500 focus:ring-gojek-500 transition-colors bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white py-3 px-4 font-semibold shadow-sm cursor-pointer"
                                                >
                                                    <option value="Bug">Ada Bug / Error nih 🐛</option>
                                                    <option value="Feature">Saran Fitur Baru 💡</option>
                                                    <option value="Question">Tanya dong 🤔</option>
                                                </select>
                                                {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                                            </div>

                                            <div>
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

                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-gojek-500 hover:bg-gojek-600 focus:outline-none focus:ring-4 focus:ring-gojek-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? 'Nirim Laporan...' : 'Kirim Sekarang 🚀'}
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
