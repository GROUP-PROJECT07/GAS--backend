const supabase = require('../supabase');
const fs = require('fs');
const path = require('path');
const { uploadToStorage } = require('../utils/storage');

exports.createCorrespondence = async (req, res) => {
  const { subject, sender, recipient, date, department } = req.body;
  const file = req.file;

  const filePath = path.join(__dirname, '..', file.path);
  const fileUpload = await uploadToStorage(filePath, file.originalname);

  if (fileUpload.error) return res.status(500).json({ error: fileUpload.error });

  const registryNumber = `GAS-${Date.now()}`;

  const { data, error } = await supabase
    .from('correspondence')
    .insert([{
      subject,
      sender,
      recipient,
      date,
      department,
      registry_number: registryNumber,
      file_url: fileUpload.url,
      created_by: req.user.id
    }]);

  if (error) return res.status(500).json({ error: error.message });

  fs.unlinkSync(filePath); // delete local temp file
  res.json({ message: 'Correspondence saved', data });
};

exports.getUserDashboard = async (req, res) => {
  const { data, error } = await supabase
    .from('correspondence')
    .select('*')
    .eq('created_by', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.getAdminDashboard = async (req, res) => {
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (userData?.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('correspondence')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
