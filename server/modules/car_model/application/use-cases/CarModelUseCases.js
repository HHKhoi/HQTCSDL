const carModelRepo = require('../../infrastructure/repositories/CarModelRepository');
const AppError = require('../../../../shared/utils/AppError');

class CarModelUseCases {
  async getAllCarModels() {
    return await carModelRepo.findAll();
  }

  async getCarModel(id) {
    const doc = await carModelRepo.findById(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async createCarModel(data) {
    if (!data.name || !data.brand || !data.carTypeId) {
      throw new AppError('Name, Brand, and CarTypeId are required', 400);
    }
    return await carModelRepo.create(data);
  }

  async updateCarModel(id, data) {
    const doc = await carModelRepo.update(id, data);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }

  async deleteCarModel(id) {
    const doc = await carModelRepo.delete(id);
    if (!doc) throw new AppError('No Document found with that ID', 404);
    return doc;
  }
}

module.exports = new CarModelUseCases();
