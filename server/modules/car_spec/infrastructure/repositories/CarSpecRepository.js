const CarSpec = require('../models/CarSpec');

class CarSpecRepository {
  async findAll() {
    return await CarSpec.find();
  }

  async findById(id) {
    return await CarSpec.findById(id);
  }

  async create(data) {
    return await CarSpec.create(data);
  }

  async update(id, data) {
    return await CarSpec.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await CarSpec.findByIdAndDelete(id);
  }
}

module.exports = new CarSpecRepository();
