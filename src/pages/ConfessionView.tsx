import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "motion/react";
import { ArrowLeft, Send, Ghost } from "lucide-react";
import ConfessionCard from "../components/ConfessionCard";
import { Confession, Comment, formatTimeAgo } from "../lib/utils";

export default function ConfessionView() {
  const [, params] = useRoute<{ id: string }>("/confession/:id");
  const id = params ? params.id : null;
  const [, navigate] = useLocation();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfession();
  }, [id]);

  const fetchConfession = async () => {
    try {
      const res = await fetch(`/api/confessions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConfession(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReact = async (confessionId: number, type: "likes" | "skull" | "fire") => {
    if (!confession) return;
    setConfession({ ...confession, [type]: (confession[type] || 0) + 1 });
    
    try {
      await fetch(`/api/confessions/${confessionId}/react`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      setConfession({ ...confession, [type]: (confession[type] || 1) - 1 });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !confession) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/confessions/${confession.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      const created = await res.json();
      setComments([...comments, created]);
      setNewComment("");
      setConfession({ ...confession, comment_count: (confession.comment_count || 0) + 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Ghost className="h-8 w-8 animate-pulse text-zinc-800" />
      </div>
    );
  }

  if (!confession) {
    return (
      <div className="py-32 text-center">
        <h2 className="font-serif text-2xl text-zinc-400">Confession not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-zinc-500 hover:text-zinc-300">
          Return to feed
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
        <button 
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ConfessionCard confession={confession} onReact={handleReact} isDetail={true} />
      </motion.div>

      <div className="mt-12">
        <h3 className="mb-6 font-serif text-2xl text-zinc-100">
          Comments <span className="text-zinc-600">({comments.length})</span>
        </h3>

        <form onSubmit={handleComment} className="mb-10 flex gap-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-5"
            >
              <p className="text-zinc-300">{comment.content}</p>
              <div className="mt-3 text-xs font-medium uppercase tracking-widest text-zinc-600">
                {formatTimeAgo(comment.created_at)}
              </div>
            </motion.div>
          ))}
          
          {comments.length === 0 && (
            <div className="py-12 text-center text-zinc-600">
              No comments yet. Be the first to react.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
