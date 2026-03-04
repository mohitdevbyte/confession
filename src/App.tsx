import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Ghost, Search, Menu, X, Send } from "lucide-react";
import Feed from "./pages/Feed";
import Trending from "./pages/Trending";
import ConfessionView from "./pages/ConfessionView";
import { About, Guidelines } from "./pages/StaticPages";
import CreateConfessionModal from "./components/CreateConfessionModal";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
            <Ghost className="h-5 w-5 text-zinc-100" />
          </div>
          <span className="font-serif text-xl font-medium tracking-wide text-zinc-100">
            Campus Whisper
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={`transition-colors hover:text-zinc-100 ${isActive("/") ? "text-zinc-100" : "text-zinc-500"}`}>
              Home
            </Link>
            <Link href="/trending" className={`transition-colors hover:text-zinc-100 ${isActive("/trending") ? "text-zinc-100" : "text-zinc-500"}`}>
              Confessions
            </Link>
            <Link href="/about" className={`transition-colors hover:text-zinc-100 ${isActive("/about") ? "text-zinc-100" : "text-zinc-500"}`}>
              About
            </Link>
            <Link href="/guidelines" className={`transition-colors hover:text-zinc-100 ${isActive("/guidelines") ? "text-zinc-100" : "text-zinc-500"}`}>
              Guidelines
            </Link>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets..."
              className="w-48 rounded-full border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all focus:w-64"
            />
          </form>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-zinc-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="border-t border-zinc-900 bg-zinc-950 px-6 py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets..."
              className="w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
          </form>

          <div className="flex flex-col gap-4 text-lg font-medium">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-zinc-100">Home</Link>
            <Link href="/trending" onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-zinc-100">Confessions</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-zinc-100">About</Link>
            <Link href="/guidelines" onClick={() => setIsMenuOpen(false)} className="text-zinc-400 hover:text-zinc-100">Guidelines</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-12 text-center text-sm text-zinc-600">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Ghost className="h-5 w-5" />
          <span className="font-serif text-lg font-medium text-zinc-400">Campus Whisper</span>
        </div>
        <p className="mb-4">
          A safe space for anonymous expression. Uncensored and untracked.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-widest">
          <Link href="/about" className="transition-colors hover:text-zinc-400">About</Link>
          <Link href="/guidelines" className="transition-colors hover:text-zinc-400">Guidelines</Link>
        </div>
        <p className="mt-12 text-zinc-800">
          &copy; {new Date().getFullYear()} Campus Whisper. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import { Route, Switch } from "wouter";

export default function App() {
  const [location, navigate] = useLocation();
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const showFloatingButton = !["/about", "/guidelines"].includes(location);

  const handleComposeClick = () => {
    setIsComposeModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-200 selection:bg-zinc-800 selection:text-zinc-50">
      <Navbar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Feed} />
          <Route path="/trending" component={Trending} />
          <Route path="/confession/:id" component={ConfessionView} />
          <Route path="/about" component={About} />
          <Route path="/guidelines" component={Guidelines} />
        </Switch>
      </div>

      {showFloatingButton && (
        <button
          onClick={handleComposeClick}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-xl transition-transform hover:scale-105 active:scale-95 sm:bottom-10 sm:right-10"
          title="Create Confession"
        >
          <Send className="h-6 w-6" />
        </button>
      )}

      <CreateConfessionModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
