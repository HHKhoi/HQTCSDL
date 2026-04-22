const express = require('express');
const orderController = require('../controllers/OrderController');

const router = express.Router();

router.route('/')
  .get(orderController.getAll)
  .post(orderController.create);

router.route('/:id')
  .get(orderController.getOne)
  .patch(orderController.update)
  .delete(orderController.delete);

module.exports = router;
