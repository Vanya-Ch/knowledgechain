const express = require('express');
const router = express.Router();
const multer = require('multer');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets/uploads/topics/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/topics
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, text, needHelp } = req.body;
    const authorId = req.user._id;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const imageUrl = req.file ? `../assets/uploads/topics/${req.file.filename}` : '';

    const topic = new Topic({
        title,
        text,
        author: authorId,
        createdAt: formattedDate,
        imageUrl,
        likes: [],
        needHelp: needHelp === 'true'
      });

    await topic.save();

    req.user.createdTopics.push(topic._id);
    await req.user.save();

    res.status(201).json({ message: 'Topic created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username avatarUrl');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при отриманні топіків' });
  }
});

router.get('/myPosts', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const topics = await Topic.find({ author: userId })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 });


    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching topic' });
  }
});

router.get('/:id', async (req, res) => {
  try {
      const topic = await Topic.findById(req.params.id).populate('author');
      if (!topic) return res.status(404).json({ message: 'Topic not found' });
      res.json(topic);
  } catch (err) {
      res.status(500).json({ message: 'Error fetching topic' });
  }
});

// POST /api/topics/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    const userId = req.user._id;

    if (!topic) return res.status(404).json({ message: 'Топік не знайдено' });

    const liked = topic.likes.includes(userId);

    if (liked) {
      topic.likes.pull(userId);
      req.user.likedTopics.pull(topic._id);
    } else {
      topic.likes.push(userId);
      req.user.likedTopics.push(topic._id);
    }

    await topic.save();
    await req.user.save();

    res.json({ message: liked ? 'Unliked' : 'Liked' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка при лайку' });
  }
});

router.post('/liked',auth, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }

    const topics = await Topic.find({ _id: { $in: ids } })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    console.error('Error in /liked route:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
      const topic = await Topic.findById(req.params.id);
      if (!topic) return res.status(404).json({ message: 'Топік не знайдено' });

      const isAuthor = topic.author.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
          return res.status(403).json({ message: 'Немає прав на видалення' });
      }

      await topic.deleteOne();
      res.json({ message: 'Топік видалено' });
  } catch (err) {
      res.status(500).json({ message: 'Помилка сервера' });
  }
});


module.exports = router;
