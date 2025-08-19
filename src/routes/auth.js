import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "GAS Backend running" });
});

router.post("/post-signup", async (req, res) => {
  try {
    console.log("Incoming post-signup hook");
    console.log("Authorization header:", req.headers.authorization);

    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "No valid user data received" });
    }

    console.log("New signup received:", user);

    const { data, error } = await supabase.from("users").upsert(
      [
        {
          id: user.id,
          email: user.email,
          role: "user",
          department: "general",
          created_at: new Date()
        }
      ],
      { onConflict: ["id"] }
    );

    if (error) {
      console.error("Error inserting/upserting user:", error);
      return res.status(500).json({ error: "Database insert failed" });
    }

    return res.status(200).json({ message: "Post-signup logic executed", user: data });
  } catch (error) {
    console.error("Error in post-signup hook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
