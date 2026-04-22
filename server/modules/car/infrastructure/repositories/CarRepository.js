const Car = require('../models/Car');

class CarRepository {
  async findAll() {
    return await Car.find().populate('modelId').populate('specId');
  }

  async findById(id) {
    return await Car.findById(id).populate('modelId').populate('specId');
  }

  async create(data) {
    return await Car.create(data);
  }

  async update(id, data) {
    return await Car.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Car.findByIdAndDelete(id);
  }
}

module.exports = new CarRepository();
