import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());

// GET all confessions
app.get("/api/confessions", async (req, res) => {
    try {
        const { sort, q } = req.query;
        let query = supabase.from("confessions").select("*");

        if (q && typeof q === "string") {
            query = query.ilike("content", `%${q}%`);
        }

        if (sort === "trending") {
            const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
            if (error) throw error;

            const sorted = (data || []).sort((a, b) => {
                const scoreA = (a.likes || 0) + (a.skull || 0) + (a.fire || 0) + (a.comment_count || 0);
                const scoreB = (b.likes || 0) + (b.skull || 0) + (b.fire || 0) + (b.comment_count || 0);
                return scoreB - scoreA;
            });

            return res.json(sorted);
        } else {
            const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
            if (error) throw error;
            return res.json(data || []);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch confessions" });
    }
});

// GET single confession with comments
app.get("/api/confessions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data: confession, error: confErr } = await supabase
            .from("confessions")
            .select("*")
            .eq("id", id)
            .single();

        if (confErr || !confession) {
            return res.status(404).json({ error: "Confession not found" });
        }

        const { data: comments, error: comErr } = await supabase
            .from("comments")
            .select("*")
            .eq("confession_id", id)
            .order("created_at", { ascending: true });

        if (comErr) throw comErr;
        res.json({ ...confession, comments: comments || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch confession" });
    }
});

// POST new confession
app.post("/api/confessions", async (req, res) => {
    try {
        const { content, color } = req.body;
        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ error: "Content is required" });
        }

        const validColors = [
            "border-zinc-800 hover:border-zinc-700",
            "border-indigo-900/50 hover:border-indigo-800/80",
            "border-rose-900/50 hover:border-rose-800/80",
            "border-emerald-900/50 hover:border-emerald-800/80",
            "border-amber-900/50 hover:border-amber-800/80",
        ];
        const safeColor = validColors.includes(color)
            ? color
            : validColors[Math.floor(Math.random() * validColors.length)];

        const { data, error } = await supabase
            .from("confessions")
            .insert({ content: content.trim(), color: safeColor })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create confession" });
    }
});

// POST reaction
app.post("/api/confessions/:id/react", async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        // Safer IP detection for Vercel/Node
        const forwarded = req.headers["x-forwarded-for"];
        const ipString = typeof forwarded === "string"
            ? forwarded.split(",")[0]
            : req.socket?.remoteAddress || "unknown";

        if (!["likes", "skull", "fire"].includes(type)) {
            return res.status(400).json({ error: "Invalid reaction type" });
        }

        const { error: reactionErr } = await supabase
            .from("confession_reactions")
            .insert({ confession_id: Number(id), ip_address: ipString, reaction_type: type });

        if (reactionErr) {
            console.error("Reaction Insert Error:", reactionErr);
            if (reactionErr.code === "23505") {
                return res.status(403).json({ error: "You've already reacted to this confession" });
            }
            throw reactionErr;
        }

        const { data: current, error: getErr } = await supabase
            .from("confessions")
            .select(type)
            .eq("id", id)
            .single();

        if (getErr || !current) {
            return res.status(404).json({ error: "Confession not found" });
        }

        const { data, error } = await supabase
            .from("confessions")
            .update({ [type]: Number(current[type] || 0) + 1 })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to react to confession" });
    }
});

// POST comment
app.post("/api/confessions/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ error: "Content is required" });
        }

        const { data: confession, error: confErr } = await supabase
            .from("confessions")
            .select("id, comment_count")
            .eq("id", id)
            .single();

        if (confErr || !confession) {
            return res.status(404).json({ error: "Confession not found" });
        }

        const { data: newComment, error: comErr } = await supabase
            .from("comments")
            .insert({ confession_id: Number(id), content: content.trim() })
            .select()
            .single();

        if (comErr) throw comErr;

        await supabase
            .from("confessions")
            .update({ comment_count: Number(confession.comment_count || 0) + 1 })
            .eq("id", id);

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to post comment" });
    }
});

export default app;
