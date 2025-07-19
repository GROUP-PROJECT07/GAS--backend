import supabase from '../services/supabaseClient.js';

export const createUser = async (req, res) => {
  const { email, role, department } = req.body;
  const { data, error } = await supabase.from('users').insert([{ email, role, department }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
};

export const getUsers = async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
};
