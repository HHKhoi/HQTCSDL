const carSpecRepo = require('../../infrastructure/repositories/CarSpecRepository');
const AppError = require('../../../../shared/utils/AppError');

class CarSpecUseCases {
  async getAllCarSpecs() {
    return await carSpecRepo.findAll();
  }

  async getCarSpec(id) {
    const doc = await carSpecRepo.findById(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async createCarSpec(data) {
    if (!data.engine || !data.horsepower || !data.fuelType) {
      throw new AppError('Engine, horsepower, and fuelType are required', 400);
    }
    return await carSpecRepo.create(data);
  }

  async updateCarSpec(id, data) {
    const doc = await carSpecRepo.update(id, data);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async deleteCarSpec(id) {
    const doc = await carSpecRepo.delete(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }
}

module.exports = new CarSpecUseCases();
