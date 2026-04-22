const CarType = require('../models/CarType');

class CarTypeRepository {
  async findAll() {
    return await CarType.find();
  }

  async findById(id) {
    return await CarType.findById(id);
  }

  async create(data) {
    return await CarType.create(data);
  }

  async update(id, data) {
    return await CarType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await CarType.findByIdAndDelete(id);
  }
}

module.exports = new CarTypeRepository();
