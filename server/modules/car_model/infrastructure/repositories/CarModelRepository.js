const CarModel = require('../models/CarModel');

class CarModelRepository {
  async findAll() {
    return await CarModel.find().populate('carTypeId');
  }

  async findById(id) {
    return await CarModel.findById(id).populate('carTypeId');
  }

  async create(data) {
    return await CarModel.create(data);
  }

  async update(id, data) {
    return await CarModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await CarModel.findByIdAndDelete(id);
  }
}

module.exports = new CarModelRepository();
