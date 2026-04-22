const Order = require('../models/Order');

class OrderRepository {
  async findAll() {
    return await Order.find().populate('carId');
  }

  async findById(id) {
    return await Order.findById(id).populate('carId');
  }

  async create(data) {
    return await Order.create(data);
  }

  async update(id, data) {
    return await Order.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Order.findByIdAndDelete(id);
  }
}

module.exports = new OrderRepository();
