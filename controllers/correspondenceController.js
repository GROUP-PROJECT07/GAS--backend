const supabase = require('../supabase');
const { uploadToStorage } = require('../utils/storage');

/**
 * Create a new correspondence
 * Supports single or multiple file uploads
 */
exports.createCorrespondence = async (req, res) => {
  try {
    const { subject, sender, recipient, date, department } = req.body;
    const files = req.files || []; // multer memoryStorage supports multiple files

    if (!subject || !sender || !recipient) {
      return res.status(400).json({ error: 'Subject, sender, and recipient are required' });
    }

    // Upload all files and collect URLs
    const uploadedFiles = [];
    for (const file of files) {
      const result = await uploadToStorage(file.buffer, file.originalname);
      if (result.error) return res.status(500).json({ error: result.error });
      uploadedFiles.push({ name: file.originalname, url: result.url });
    }

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
        attachments: uploadedFiles, // store array of {name, url}
        created_by: req.user.id,
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Correspondence saved', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get dashboard data for the logged-in user
 */
exports.getUserDashboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('correspondence')
      .select('*')
      .eq('created_by', req.user.id);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all correspondence for admins
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (userError) return res.status(500).json({ error: userError.message });
    if (userData?.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('correspondence')
      .select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
