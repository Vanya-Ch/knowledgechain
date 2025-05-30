const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(); 
    }

    const user = await User.findById(req.user._id);
    if (user && user.isBanned) {
      return res.status(403).send(`
        <html>
          <head><title>Banned</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>🚫 Your account was banned</h1>
            <p>Try to contact the administration</p>
          </body>
        </html>
      `);
    }

    next();
  } catch (err) {
    console.error('Помилка перевірки бану:', err);
    res.status(500).send('Серверна помилка при перевірці бану');
  }
};
