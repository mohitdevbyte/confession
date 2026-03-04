import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, AlertCircle, X } from "lucide-react";
import { ACCENTS } from "../lib/utils";

interface CreateConfessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateConfessionModal({ isOpen, onClose }: CreateConfessionModalProps) {
    const [newConfession, setNewConfession] = useState("");
    const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newConfession.trim()) return;

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/confessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newConfession, color: selectedAccent }),
            });

            if (!res.ok) throw new Error("Failed to post confession");

            // We don't need to manually update the feed because Supabase Realtime will handle it

            setNewConfession("");
            setSelectedAccent(ACCENTS[0]);
            onClose();
        } catch (err) {
            setError("Failed to post your confession. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-1 shadow-2xl backdrop-blur-md"
                    >
                        <div className="relative rounded-[22px] bg-zinc-950 p-6 sm:p-8">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h2 className="mb-6 font-serif text-2xl text-zinc-100">Whisper a secret</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <textarea
                                        autoFocus
                                        value={newConfession}
                                        onChange={(e) => setNewConfession(e.target.value)}
                                        placeholder="Spill the tea, confess your sins, no holding back..."
                                        className="min-h-[160px] w-full resize-none bg-transparent font-serif text-xl leading-relaxed text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
                                        maxLength={1000}
                                    />
                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs font-medium text-zinc-600">
                                        <span>Anything goes. 100% anonymous.</span>
                                        <span>{newConfession.length}/1000</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Aura</span>
                                        <div className="flex gap-2">
                                            {ACCENTS.map((accent, i) => {
                                                const colorClass =
                                                    i === 0 ? "bg-zinc-800" :
                                                        i === 1 ? "bg-indigo-900" :
                                                            i === 2 ? "bg-rose-900" :
                                                                i === 3 ? "bg-emerald-900" :
                                                                    "bg-amber-900";

                                                return (
                                                    <button
                                                        key={accent}
                                                        type="button"
                                                        onClick={() => setSelectedAccent(accent)}
                                                        className={`h-6 w-6 rounded-full transition-all ${colorClass} ${selectedAccent === accent ? "ring-2 ring-zinc-400 ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-50 hover:opacity-100"}`}
                                                        aria-label={`Select aura ${i}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {error && (
                                            <div className="flex items-center gap-1.5 text-sm text-rose-500">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{error}</span>
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !newConfession.trim()}
                                            className="group flex w-full items-center justify-center gap-2 rounded-full bg-zinc-100 px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white border hover:border-zinc-300 disabled:opacity-50 sm:w-auto active:scale-95"
                                        >
                                            {isSubmitting ? "Whispering..." : "Confess"}
                                            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
