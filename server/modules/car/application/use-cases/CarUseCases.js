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
    if (!data.modelId || !data.specId || !data.price) {
      throw new AppError('ModelId, specId, and price are required', 400);
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
