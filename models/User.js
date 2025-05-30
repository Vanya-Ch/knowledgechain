const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  likedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  avatarUrl: { type: String, default: '../assets/images/default-avatar.png' },
  isBanned: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);