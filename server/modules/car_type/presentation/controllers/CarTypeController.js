const carTypeUseCases = require('../../application/use-cases/CarTypeUseCases');

class CarTypeController {
  async getAll(req, res, next) {
    try {
      const doc = await carTypeUseCases.getAllCarTypes();
      res.status(200).json({ status: 'success', results: doc.length, data: { doc } });
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const doc = await carTypeUseCases.getCarType(req.params.id);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doc = await carTypeUseCases.createCarType(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doc = await carTypeUseCases.updateCarType(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await carTypeUseCases.deleteCarType(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) { next(err); }
  }
}

module.exports = new CarTypeController();
