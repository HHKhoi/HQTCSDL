const express = require('express');
const carTypeController = require('../controllers/CarTypeController');

const router = express.Router();

router.route('/')
  .get(carTypeController.getAll)
  .post(carTypeController.create);

router.route('/:id')
  .get(carTypeController.getOne)
  .patch(carTypeController.update)
  .delete(carTypeController.delete);

module.exports = router;
