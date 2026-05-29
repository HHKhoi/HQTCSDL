const Order = require('../models/Order');

class OrderRepository {
  async findAll() {
    return await Order.find().populate({
      path: 'carId',
      populate: {
        path: 'modelId'
      }
    });
  }

  async findById(id) {
    return await Order.findById(id).populate({
      path: 'carId',
      populate: {
        path: 'modelId'
      }
    });
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
