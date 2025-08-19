// src/routes/auth.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const router = express.Router();

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role key is required here
);

// Supabase will include this secret in the Authorization header
const SUPABASE_HOOK_SECRET = process.env.SUPABASE_HOOK_SECRET || "";

router.post("/post-signup", async (req, res) => {
  try {
    // Verify hook request is from Supabase
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${SUPABASE_HOOK_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // Supabase sends user info in the body
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: "No user data received" });
    }

    console.log("New signup received:", user);

    // Insert new user into "users" table with a default role & department
    const { error } = await supabase.from("users").insert([
      {
        id: user.id,
        email: user.email,
        role: "user", // default role
        department: "general", // or set dynamically later
      },
    ]);

    if (error) {
      console.error("Error inserting user into users table:", error);
      return res.status(500).json({ error: "Database insert failed" });
    }

    return res
      .status(200)
      .json({ message: "Post-signup logic executed", user });
  } catch (error) {
    console.error("Error in post-signup hook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
