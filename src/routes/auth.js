// src/routes/auth.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_HOOK_SECRET = process.env.SUPABASE_HOOK_SECRET || "";

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "GAS Backend running" });
});

router.post("/post-signup", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${SUPABASE_HOOK_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: "No user data received" });
    }

    console.log("New signup received:", user);

    const { error } = await supabase.from("users").insert([
      {
        id: user.id,
        email: user.email,
        role: "user",
        department: "general",
      },
    ]);

    if (error) {
      console.error("Error inserting user into users table:", error);
      return res.status(500).json({ error: "Database insert failed" });
    }

    return res.status(200).json({ message: "Post-signup logic executed", user });
  } catch (error) {
    console.error("Error in post-signup hook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
