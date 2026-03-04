import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Ghost, TrendingUp, Clock, Search, SlidersHorizontal, X } from "lucide-react";
import ConfessionCard from "../components/ConfessionCard";
import { Confession, getDeviceId } from "../lib/utils";
import { supabase } from "../lib/supabase";

type SortMode = "latest" | "trending";

export default function Trending() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [sortBy, setSortBy] = useState<SortMode>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchConfessions();

    const channel = supabase
      .channel('schema-db-changes-trending')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'confessions' },
        (payload) => {
          setConfessions((current) => {
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
  }, [sortBy, searchQuery]);

  const fetchConfessions = async () => {
    try {
      let url = `/api/confessions?sort=${sortBy}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConfessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReact = async (id: number, type: "likes" | "skull" | "fire") => {
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
      setConfessions(confessions.map(c => c.id === id ? { ...c, [type]: (c[type] || 1) - 1 } : c));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
      {/* Header */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          <div>
            <h1 className="mb-3 font-serif text-4xl font-medium tracking-tight text-zinc-100 sm:text-5xl">
              All Confessions
            </h1>
            <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
              Every secret, every whisper — all in one place. Filter through the noise.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Sort Tabs */}
            <div className="flex items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-sm">
              <button
                onClick={() => setSortBy("trending")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${sortBy === "trending"
                  ? "bg-amber-950/60 text-amber-400 shadow-sm border border-amber-900/50"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
              >
                <Flame className="h-4 w-4" />
                Trending
              </button>
              <button
                onClick={() => setSortBy("latest")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${sortBy === "latest"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
              >
                <Clock className="h-4 w-4" />
                Latest
              </button>
            </div>

            {/* Search + Info */}
            <div className="flex items-center gap-4">
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search confessions..."
                    autoFocus
                    className="w-56 rounded-full border border-zinc-700 bg-zinc-900/80 py-2.5 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:w-64"
                  />
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}

              <div className="rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-500">
                {confessions.length} whisper{confessions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Active search indicator */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-zinc-400">
                Results for <span className="font-medium italic text-zinc-200">"{searchQuery}"</span>
              </span>
              <button
                onClick={clearSearch}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                Clear
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Confession Grid */}
      <section>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {confessions.map((confession, index) => (
              <motion.div
                key={confession.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.02 }}
              >
                <ConfessionCard confession={confession} onReact={handleReact} />
              </motion.div>
            ))}
          </AnimatePresence>

          {confessions.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Ghost className="mx-auto mb-6 h-16 w-16 text-zinc-800" />
              <h3 className="mb-2 font-serif text-2xl text-zinc-400">
                {searchQuery ? "No matches found" : "Nothing here yet"}
              </h3>
              <p className="text-zinc-600">
                {searchQuery
                  ? "Try a different search term."
                  : "Be the first to whisper a secret."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
