const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conferences', require('./routes/conferences'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/', (req, res) => {
  res.send('Conference Management API is running.');
});

// Sync database and start server
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('Database error:', err));
