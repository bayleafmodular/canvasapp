require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./lib/supabase');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'https://canvasapp-coral.vercel.app'] }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/drawings', require('./routes/drawings'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
