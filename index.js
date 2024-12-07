import express from 'express';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

const app = express();
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
