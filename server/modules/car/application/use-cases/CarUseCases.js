const carRepo = require('../../infrastructure/repositories/CarRepository');
const AppError = require('../../../../shared/utils/AppError');

class CarUseCases {
  async getAllCars() {
    return await carRepo.findAll();
  }

  async getCar(id) {
    const doc = await carRepo.findById(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async createCar(data) {
    if (!data.modelId || !data.price) {
      throw new AppError('ModelId and price are required', 400);
    }

    if (!data.specId) {
      const CarSpec = require('../../../car_spec/infrastructure/models/CarSpec');
      const specDoc = await CarSpec.create({ specs: [] });
      data.specId = specDoc._id;
    }

    return await carRepo.create(data);
  }

  async updateCar(id, data) {
    const doc = await carRepo.update(id, data);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async deleteCar(id) {
    const doc = await carRepo.delete(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }
}

module.exports = new CarUseCases();
