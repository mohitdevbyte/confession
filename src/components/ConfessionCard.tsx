import React, { useState } from "react";
import { Link } from "wouter";
import { Share2 } from "lucide-react";
import { Confession, formatTimeAgo } from "../lib/utils";

interface ConfessionCardProps {
  confession: Confession;
  onReact: (id: number, type: "likes" | "skull" | "fire") => void;
  isDetail?: boolean;
}

export default function ConfessionCard({ confession, onReact, isDetail = false }: ConfessionCardProps) {
  const [copied, setCopied] = useState(false);

  // Fallback for old confessions that used background colors instead of borders
  const isOldColor = confession.color.startsWith('bg-');
  const cardClass = isOldColor
    ? "border-zinc-800 hover:border-zinc-700"
    : confession.color;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/confession/${confession.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (e: React.MouseEvent, type: "likes" | "skull" | "fire") => {
    e.preventDefault();
    e.stopPropagation();
    onReact(confession.id, type);
  };

  const CardWrapper = isDetail ? 'div' : Link;
  const wrapperProps = isDetail ? {} : { href: `/confession/${confession.id}` };

  return (
    <CardWrapper
      {...wrapperProps as any}
      className={`block mb-6 break-inside-avoid rounded-3xl border bg-zinc-900/30 p-6 sm:p-8 shadow-sm transition-all hover:bg-zinc-900/60 ${cardClass}`}
    >
      <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-200 sm:text-lg">
        {confession.content}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/50 pt-4">
        <span className="text-xs text-zinc-500">
          {formatTimeAgo(confession.created_at)}
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={(e) => handleReaction(e, "likes")}
            className="group flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 transition-all hover:border-rose-900/60 hover:bg-rose-950/20 active:scale-95"
          >
            <span className="text-sm">❤️</span>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-rose-400">{confession.likes || 0}</span>
          </button>

          <button
            onClick={(e) => handleReaction(e, "fire")}
            className="group flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 transition-all hover:border-amber-900/60 hover:bg-amber-950/20 active:scale-95"
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-amber-400">{confession.fire || 0}</span>
          </button>

          <button
            onClick={(e) => handleReaction(e, "skull")}
            className="group flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 transition-all hover:border-zinc-700 hover:bg-zinc-800 active:scale-95"
          >
            <span className="text-sm">💀</span>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">{confession.skull || 0}</span>
          </button>

          {!isDetail && (
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5">
              <span className="text-sm">💬</span>
              <span className="text-xs font-medium text-zinc-400">{confession.comment_count || 0}</span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="group flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 p-1.5 transition-all hover:border-zinc-700 hover:bg-zinc-800 active:scale-95"
            title={copied ? "Copied!" : "Copy Link"}
          >
            <Share2 className={`h-3.5 w-3.5 ${copied ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
          </button>
        </div>
      </div>
    </CardWrapper>
  );
}
