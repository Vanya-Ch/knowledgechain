const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');


// ⚙️ Налаштування multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.username}-avatar${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post('/update-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatarUrl && !user.avatarUrl.includes('default-avatar')) {
      const oldPath = path.join(__dirname, '..', 'pages', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const ext = path.extname(req.file.originalname);
    const newFileName = `${req.user.username}-avatar${ext}`;
    const newAvatarPath = `../assets/uploads/avatars/${newFileName}`;

    user.avatarUrl = newAvatarPath;
    await user.save();

    res.json({ success: true, avatarUrl: newAvatarPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ username: req.user.username, avatarUrl: req.user.avatarUrl });
});

// GET /api/user/current
router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('_id username avatarUrl likedTopics role');

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при отриманні користувача' });
  }
});

module.exports = router;
