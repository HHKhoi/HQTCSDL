const express = require('express');
const carSpecController = require('../controllers/CarSpecController');

const router = express.Router();

router.route('/')
  .get(carSpecController.getAll)
  .post(carSpecController.create);

router.route('/:id')
  .get(carSpecController.getOne)
  .patch(carSpecController.update)
  .delete(carSpecController.delete);

module.exports = router;
