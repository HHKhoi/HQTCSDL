const carModelUseCases = require('../../application/use-cases/CarModelUseCases');

class CarModelController {
  async getAll(req, res, next) {
    try {
      const doc = await carModelUseCases.getAllCarModels();
      res.status(200).json({ status: 'success', results: doc.length, data: { doc } });
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const doc = await carModelUseCases.getCarModel(req.params.id);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doc = await carModelUseCases.createCarModel(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doc = await carModelUseCases.updateCarModel(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await carModelUseCases.deleteCarModel(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) { next(err); }
  }
}

module.exports = new CarModelController();
