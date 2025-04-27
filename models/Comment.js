const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: {
        username: String,
        avatarUrl: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);
