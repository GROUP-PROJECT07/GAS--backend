import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/post-signup", async (req, res) => {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.SUPABASE_HOOK_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { user, type } = req.body;
    console.log("Auth hook payload:", req.body);

    if (!user || !user.id) {
      return res.status(400).json({ error: "Invalid payload: no user.id" });
    }

    const { error } = await supabase.from("users").insert([
      {
        id: user.id, 
        email: user.email,
        role: "user", 
        department: null,
      },
    ]);

    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ error: "Failed to insert user" });
    }

    res.status(200).json({ message: "Post-signup logic executed", userId: user.id });
  } catch (err) {
    console.error("Post-signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
