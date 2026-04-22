const carSpecUseCases = require('../../application/use-cases/CarSpecUseCases');

class CarSpecController {
  async getAll(req, res, next) {
    try {
      const doc = await carSpecUseCases.getAllCarSpecs();
      res.status(200).json({ status: 'success', results: doc.length, data: { doc } });
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const doc = await carSpecUseCases.getCarSpec(req.params.id);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doc = await carSpecUseCases.createCarSpec(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doc = await carSpecUseCases.updateCarSpec(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await carSpecUseCases.deleteCarSpec(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) { next(err); }
  }
}

module.exports = new CarSpecController();
