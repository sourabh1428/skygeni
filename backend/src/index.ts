import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors()); // Allow all origins for now
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Revenue Intelligence API is running');
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
