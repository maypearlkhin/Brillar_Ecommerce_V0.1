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
import atenxionUserRoutes from './routes/atenxionUser.routes';
import docsRoutes from './routes/docs.routes';
import { setupSwaggerDocs } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
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

setupSwaggerDocs(app);
app.use('/api/docs', docsRoutes);

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/atenxionUser', atenxionUserRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api', customerRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
