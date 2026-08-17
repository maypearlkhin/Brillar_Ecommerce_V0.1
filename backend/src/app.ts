import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/auth.routes';
import publicRoutes from './routes/public.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import adminRoutes from './routes/admin.routes';
import integrationRoutes from './routes/integration.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', customerRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/integration', integrationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
