// src/routes/auth.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Supabase service role client (only use on backend!)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/post-signup", async (req, res) => {
  try {
    const { user, type } = req.body; // Supabase sends event payload
    console.log("Auth hook payload:", req.body);

    if (!user || !user.id) {
      return res.status(400).json({ error: "Invalid payload: no user.id" });
    }

    // Example custom logic: Insert new user into `users` table
    const { error } = await supabase.from("users").insert([
      {
        id: user.id, // same UUID as auth.users
        email: user.email,
        role: "user", // default role
        department: null, // set later by admin
      },
    ]);

    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ error: "Failed to insert user" });
    }

    // Optional: trigger welcome email (via Nodemailer, Resend, etc.)
    // await sendWelcomeEmail(user.email);

    res.status(200).json({ message: "Post-signup logic executed", userId: user.id });
  } catch (err) {
    console.error("Post-signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
