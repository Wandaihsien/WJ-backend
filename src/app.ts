import express from 'express';
import orderRoutes from './routes/order';
import authRoutes from './routes/auth';

const app = express();
app.use(express.json());

app.use('/order', orderRoutes);
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;