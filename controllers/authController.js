const supabase = require('../supabase');

exports.register = async (req, res) => {
  const { email, password, role = 'user', department = null } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: data.user.id,
        email,
        role,
        department,
      },
    ]);

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return res.status(500).json({ error: profileError.message });
  }

  res.status(201).json({
    user: data.user,
    message: 'Registration successful, please check your email to confirm.',
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  res.json({ session: data.session, user: data.user });
};
