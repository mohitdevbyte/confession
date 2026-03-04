import React from "react";
import { motion } from "motion/react";

export function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 font-serif text-4xl font-medium text-zinc-100 sm:text-5xl">
          About <span className="italic text-zinc-500">Campus Whisper</span>
        </h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-lg leading-relaxed text-zinc-400">
            Campus Whisper was created as a digital sanctuary for students to express their true feelings, 
            share untold stories, and connect through shared experiences without the pressure of identity.
          </p>
          
          <h2 className="mt-12 mb-4 font-serif text-2xl text-zinc-200">The Philosophy</h2>
          <p className="text-zinc-400">
            In an era of hyper-curated social media profiles, we believe there's immense value in raw, 
            unfiltered honesty. This platform strips away names, profile pictures, and follower counts, 
            leaving only the words themselves.
          </p>
          
          <h2 className="mt-12 mb-4 font-serif text-2xl text-zinc-200">How it Works</h2>
          <ul className="list-disc space-y-2 pl-6 text-zinc-400">
            <li><strong>100% Anonymous:</strong> We don't track IP addresses, require logins, or use cookies to identify you.</li>
            <li><strong>Auras:</strong> Express the mood of your confession using subtle color accents.</li>
            <li><strong>Reactions:</strong> Connect with others' stories using hearts, fire, or skulls.</li>
          </ul>
        </div>
      </motion.div>
    </main>
  );
}

export function Guidelines() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 font-serif text-4xl font-medium text-zinc-100 sm:text-5xl">
          Community <span className="italic text-zinc-500">Guidelines</span>
        </h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-lg leading-relaxed text-zinc-400">
            This is the Wild West of campus thoughts. We believe in radical free expression. 
            Spill the tea, confess your sins, and hold nothing back.
          </p>
          
          <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
            <h2 className="mb-6 font-serif text-2xl text-zinc-200">The Unwritten Rules</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-zinc-300">1. Anything Goes</h3>
                <p className="mt-2 text-zinc-500">
                  This is an uncensored space. Speak your mind. Whether it's a controversial opinion, 
                  a hidden crush, or a deep regret, this is the place for it.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-zinc-300">2. Protect Identities</h3>
                <p className="mt-2 text-zinc-500">
                  While we don't censor content, we strongly advise against using full real names of 
                  other students. Use initials or vague descriptions. Protect the innocent (and the guilty).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-zinc-300">3. No Illegal Content</h3>
                <p className="mt-2 text-zinc-500">
                  Free speech has limits. Threats of violence, illegal activities, or severe harassment 
                  will be removed if reported. Keep it wild, but keep it legal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
