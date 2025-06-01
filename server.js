const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.js');
const avatarRoutes = require('./routes/user.js')
const topicRoutes = require('./routes/topic.js');
const commentRoutes = require('./routes/comment.js');
const auth = require('./middleware/auth.js')
const checkBan = require('./middleware/checkBan.js');

const app = express();

const URL = "mongodb+srv://mrvanya383:banan231@diplomwork.rclhut9.mongodb.net/?retryWrites=true&w=majority&appName=DiplomWork";
const PORT = 3000;

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', authRoutes);
app.use('/api/user', avatarRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);

mongoose
    .connect(URL)
    .then((res) => console.log('Connected to MongoDB'))
    .catch((err) => console.log(`DB connection error: ${err}`));

app.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`listening port ${PORT}`);
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/create', auth, checkBan, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/create-post.html'));
});

app.get('/topic', checkBan, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/topic.html'));
});

app.get('/liked', auth, checkBan, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/liked.html'));
});

app.get('/myPosts', auth, checkBan, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/my-posts.html'));
});

app.get('/users', auth, checkBan, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/users.html'));
});