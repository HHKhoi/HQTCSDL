const orderRepo = require('../../infrastructure/repositories/OrderRepository');
const Car = require('../../../car/infrastructure/models/Car');
const AppError = require('../../../../shared/utils/AppError');

class OrderUseCases {
  async getAllOrders() {
    return await orderRepo.findAll();
  }

  async getOrder(id) {
    const doc = await orderRepo.findById(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async createOrder(data) {
    if (!data.carId || !data.price) {
      throw new AppError('CarId and Price are required', 400);
    }
    
    // Check if car is available
    const car = await Car.findById(data.carId);
    if (!car) throw new AppError('Car not found', 404);
    if (car.status === 'sold') throw new AppError('Car is already sold', 400);

    // Generate unique order code: ORD-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    data.orderCode = `ORD-${date}-${random}`;
    data.status = 'pending';

    const order = await orderRepo.create(data);
    
    // Update car status
    car.status = 'reserved';
    await car.save();

    return order;
  }

  async updateOrder(id, data) {
    const oldOrder = await orderRepo.findById(id);
    if (!oldOrder) throw new AppError('No Document found with that ID', 404);

    const doc = await orderRepo.update(id, data);
    
    // Sync Car status if order status changed
    if (data.status && data.status !== oldOrder.status) {
      const car = await Car.findById(oldOrder.carId);
      if (car) {
        if (data.status === 'completed') {
          car.status = 'sold';
          data.completedAt = new Date();
        } else if (data.status === 'cancelled') {
          car.status = 'available';
          data.cancelledAt = new Date();
        }
        await car.save();
      }
    }

    return doc;
  }

  async deleteOrder(id) {
    const doc = await orderRepo.delete(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }
}

module.exports = new OrderUseCases();
