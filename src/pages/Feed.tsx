import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { Send, Ghost, AlertCircle, Flame, Clock } from "lucide-react";
import ConfessionCard from "../components/ConfessionCard";
import { Confession, ACCENTS, getDeviceId } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function Feed() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newConfession, setNewConfession] = useState("");
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sortBy = location === "/trending" ? "trending" : "latest";
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchConfessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'confessions' },
        (payload) => {
          setConfessions((current) => {
            // Prevent duplicates (e.g. if we just posted it ourselves)
            if (current.some(c => c.id === payload.new.id)) return current;
            return [payload.new as Confession, ...current];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'confessions' },
        (payload) => {
          setConfessions((current) =>
            current.map(c => c.id === payload.new.id ? { ...c, ...payload.new as Confession } : c)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortBy, query]);

  const fetchConfessions = async () => {
    try {
      let url = `/api/confessions?sort=${sortBy}`;
      if (query) url += `&q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConfessions(data);
    } catch (err) {
      console.error(err);
    }
  };

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

      // No manual UI update needed, Supabase Realtime handles it!

      setNewConfession("");
      setSelectedAccent(ACCENTS[0]);
    } catch (err) {
      setError("Failed to post your confession. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async (id: number, type: "likes" | "skull" | "fire") => {
    // Optimistic update
    setConfessions(confessions.map(c => c.id === id ? { ...c, [type]: (c[type] || 0) + 1 } : c));

    try {
      await fetch(`/api/confessions/${id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": getDeviceId()
        },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      // Revert on failure
      setConfessions(confessions.map(c => c.id === id ? { ...c, [type]: (c[type] || 1) - 1 } : c));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
      {/* Hero Section */}
      {!query && (
        <section className="mb-20 text-center sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 font-serif text-5xl font-medium leading-tight tracking-tight text-zinc-100 sm:text-7xl">
              What's your <span className="italic text-zinc-500">secret?</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl">
              Unburden your mind. Share your untold stories, hidden crushes, and deepest regrets.
              <span className="text-zinc-200"> 100% anonymous. No tracking. Just truth.</span>
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/trending"
                className="group flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-8 py-3.5 text-sm font-semibold text-zinc-100 backdrop-blur-sm transition-all hover:border-zinc-500 hover:bg-zinc-800"
              >
                See Confessions
                <Flame className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* Compose Section */}
      {!query && (
        <section className="mb-20" id="compose">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-1 shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-[22px] bg-zinc-950 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <textarea
                    value={newConfession}
                    onChange={(e) => setNewConfession(e.target.value)}
                    placeholder="Spill the tea, confess your sins, no holding back..."
                    className="min-h-[160px] w-full resize-none bg-transparent font-serif text-xl leading-relaxed text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
                    maxLength={1000}
                  />
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs font-medium text-zinc-600">
                    <span>Anything goes.</span>
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
        </section>
      )}

      {/* Feed Section */}
      <section>
        <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          {query ? (
            <h2 className="text-2xl font-serif text-zinc-100">
              Search results for <span className="italic text-zinc-400">"{query}"</span>
            </h2>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-sm">
              <Link href="/" className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${sortBy === "latest" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}>
                <Clock className="h-4 w-4" />
                Latest
              </Link>
              <Link href="/trending" className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${sortBy === "trending" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}>
                <Flame className="h-4 w-4" />
                Trending
              </Link>
            </div>
          )}

          <div className="text-sm font-medium text-zinc-500">
            {confessions.length} whispers
          </div>
        </div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {confessions.map((confession) => (
              <motion.div
                key={confession.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ConfessionCard confession={confession} onReact={handleReact} />
              </motion.div>
            ))}
          </AnimatePresence>

          {confessions.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Ghost className="mx-auto mb-6 h-16 w-16 text-zinc-800" />
              <h3 className="mb-2 font-serif text-2xl text-zinc-400">The void is empty</h3>
              <p className="text-zinc-600">
                {query ? "No secrets match your search." : "Be the first to whisper a secret."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
