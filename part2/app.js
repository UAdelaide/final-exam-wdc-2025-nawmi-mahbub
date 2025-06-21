const express = require('express');
const session = require('express-session');
const path = require('path');
const userRoutes = require('./routes/userroutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // ✅ Important: allows POST body parsing

app.use(session({
  secret: 'mySecretKey', // use a strong secret in production
  resave: false,
  saveUninitialized: false
}));

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', userRoutes); // ✅ must be mounted under /api

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
