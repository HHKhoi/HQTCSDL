const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./shared/utils/errorHandler');
const AppError = require('./shared/utils/AppError');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./modules/auth/presentation/routes/authRoutes');
const carTypeRoutes = require('./modules/car_type/presentation/routes/carTypeRoutes');
const carModelRoutes = require('./modules/car_model/presentation/routes/carModelRoutes');
const carSpecRoutes = require('./modules/car_spec/presentation/routes/carSpecRoutes');
const carRoutes = require('./modules/car/presentation/routes/carRoutes');
const orderRoutes = require('./modules/order/presentation/routes/orderRoutes');
const analyticsRoutes = require('./modules/analytics/presentation/routes/analyticsRoutes');

// Routes will go here
app.use('/api/auth', authRoutes);
app.use('/api/car-types', carTypeRoutes);
app.use('/api/car-models', carModelRoutes);
app.use('/api/car-specs', carSpecRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API works' });
});

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
