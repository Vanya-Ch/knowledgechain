const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ Дозволені типи файлів
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

// ✅ Налаштування з фільтром і лімітом розміру
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

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неприпустимий тип файлу. Дозволено лише .jpg, .png, .webp'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// 🖼️ POST /api/user/update-avatar
router.post('/update-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не був завантажений' });
    }

    const user = await User.findById(req.user._id);

    // 🧹 Видалення старого аватара (не дефолтного)
    if (user.avatarUrl && !user.avatarUrl.includes('default-avatar')) {
      const oldPath = path.join(__dirname, '..', user.avatarUrl.replace(/^\/?/, ''));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // ✅ Оновлення шляху нового аватара
    const ext = path.extname(req.file.originalname);
    const newFileName = `${req.user.username}-avatar${ext}`;
    const newAvatarPath = `/assets/uploads/avatars/${newFileName}`;

    user.avatarUrl = newAvatarPath;
    await user.save();

    res.json({ success: true, avatarUrl: newAvatarPath });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// 🧑‍💻 GET /api/user/me
router.get('/me', auth, (req, res) => {
  res.json({ username: req.user.username, avatarUrl: req.user.avatarUrl });
});

// 🧑‍🤝‍🧑 GET /api/user/current
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

// 📋 GET /api/user/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username role isBanned');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при отриманні користувачів' });
  }
});

// 🔒 PUT /api/user/:id/ban
router.put('/:id/ban', async (req, res) => {
  const { id } = req.params;
  const { isBanned } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true });
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при оновленні користувача' });
  }
});

// 🛠️ Обробка Multer-винятків
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
