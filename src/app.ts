import express from 'express';
import orderRoutes from './routes/order';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import cors from 'cors';


const app = express();


app.use(express.json());
app.use(cors());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);



export default app;