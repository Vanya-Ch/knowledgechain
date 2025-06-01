const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


router.post('/register', async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Усі поля обовʼязкові' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Користувач з таким логіном вже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      name,
      password: hashedPassword
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false 
    });

    res.status(201).json({ message: 'Користувача створено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Усі поля обовʼязкові' });
    }
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'Користувач не знайдений' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Невірний пароль' });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role , username: user.username, avatarUrl: user.avatarUrl, likedTopics: user.likedTopics, createdTopics: user.createdTopics}, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false  
      });
  
      res.status(200).json({ message: 'Логін успішний' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
});

  

module.exports = router;