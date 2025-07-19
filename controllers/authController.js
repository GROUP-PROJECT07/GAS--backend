const supabase = require('../supabase');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  res.json({ session: data.session, user: data.user });
};
