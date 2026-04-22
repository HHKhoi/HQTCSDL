const carTypeRepo = require('../../infrastructure/repositories/CarTypeRepository');
const AppError = require('../../../../shared/utils/AppError');

class CarTypeUseCases {
  async getAllCarTypes() {
    return await carTypeRepo.findAll();
  }

  async getCarType(id) {
    const carType = await carTypeRepo.findById(id);
    if (!carType) throw new AppError('No Car Type found with that ID', 404);
    return carType;
  }

  async createCarType(data) {
    if (!data.name) throw new AppError('Car Type name is required', 400);
    return await carTypeRepo.create(data);
  }

  async updateCarType(id, data) {
    const carType = await carTypeRepo.update(id, data);
    if (!carType) throw new AppError('No Car Type found with that ID', 404);
    return carType;
  }

  async deleteCarType(id) {
    const carType = await carTypeRepo.delete(id);
    if (!carType) throw new AppError('No Car Type found with that ID', 404);
    return carType;
  }
}

module.exports = new CarTypeUseCases();
