const orderUseCases = require('../../application/use-cases/OrderUseCases');

class OrderController {
  async getAll(req, res, next) {
    try {
      const doc = await orderUseCases.getAllOrders();
      res.status(200).json({ status: 'success', results: doc.length, data: { doc } });
    } catch (err) { next(err); }
  }

  async getOne(req, res, next) {
    try {
      const doc = await orderUseCases.getOrder(req.params.id);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const doc = await orderUseCases.createOrder(req.body);
      res.status(201).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const doc = await orderUseCases.updateOrder(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { doc } });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await orderUseCases.deleteOrder(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) { next(err); }
  }
}

module.exports = new OrderController();
