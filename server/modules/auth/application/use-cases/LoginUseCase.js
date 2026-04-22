const userRepository = require('../../infrastructure/repositories/UserRepository');
const AppError = require('../../../../shared/utils/AppError');

class LoginUseCase {
  async execute(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400);
    }

    const user = await userRepository.findByEmailWithPassword(email);

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    return user;
  }
}

module.exports = new LoginUseCase();
