const express = require('express');
const carModelController = require('../controllers/CarModelController');

const router = express.Router();

router.route('/')
  .get(carModelController.getAll)
  .post(carModelController.create);

router.route('/:id')
  .get(carModelController.getOne)
  .patch(carModelController.update)
  .delete(carModelController.delete);

module.exports = router;
