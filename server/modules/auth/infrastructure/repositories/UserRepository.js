const User = require('../models/UserModel');

class UserRepository {
  async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findById(id) {
    return await User.findById(id);
  }

  async create(userData) {
    return await User.create(userData);
  }
}

module.exports = new UserRepository();
