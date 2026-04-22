const express = require('express');
const carController = require('../controllers/CarController');

const router = express.Router();

router.route('/')
  .get(carController.getAll)
  .post(carController.create);

router.route('/:id')
  .get(carController.getOne)
  .patch(carController.update)
  .delete(carController.delete);

module.exports = router;
