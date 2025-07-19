const express = require('express');
const multer = require('multer');
const { requireUser } = require('../middleware/authMiddleware');
const {
  createCorrespondence,
  getUserDashboard,
  getAdminDashboard
} = require('../controllers/correspondenceController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', requireUser, upload.single('file'), createCorrespondence);
router.get('/user', requireUser, getUserDashboard);
router.get('/admin', requireUser, getAdminDashboard);

module.exports = router;
