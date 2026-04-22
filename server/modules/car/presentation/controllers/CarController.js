const carUseCases = require('../../application/use-cases/CarUseCases');

class CarController {
  async getAll(req, res, next) {
    try {
      const doc = await carUseCases.getAllCars();
      res.status(200).json({ status: 'success', results: doc.length, data: { doc } });
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const doc = await carUseCases.getCar(req.params.id);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doc = await carUseCases.createCar(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doc = await carUseCases.updateCar(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await carUseCases.deleteCar(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) { next(err); }
  }
}

module.exports = new CarController();
