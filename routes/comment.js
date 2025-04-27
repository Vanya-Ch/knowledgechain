const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Створити коментар
router.post('/:topicId', auth, async (req, res) => {
    try {
        const comment = new Comment({
            text: req.body.text,
            topicId: req.params.topicId,
            author: {
                username: req.user.username,
                avatarUrl: req.user.avatarUrl,
                userId: req.user._id,
            },
        });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: 'Помилка при створенні коментаря' });
    }
});

// Отримати коментарі до топіку
router.get('/:topicId', async (req, res) => {
    try {
        const comments = await Comment.find({ topicId: req.params.topicId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Помилка при отриманні коментарів' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Коментар не знайдено' });

        const authorId = comment.author.userId.toString();
        const currentUserId = req.user._id.toString();
        const isAuthor = authorId === currentUserId;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Немає прав на видалення коментаря' });
        }

        await comment.deleteOne();
        res.json({ message: 'Коментар видалено' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
