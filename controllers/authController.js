const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data.user, session: data.session });
};

// Signup
const signup = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data.user });
};

// Logout
const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Logged out successfully' });
};

// Get current user
const getUser = async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user });
};

module.exports = {
  login,
  signup,
  logout,
  getUser,
};
