const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: { type: String, default: '' },
  needHelp: { type: Boolean, default: false },
  tags: [{ type: String }] 
});

module.exports = mongoose.model('Topic', topicSchema);
