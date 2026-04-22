const loginUseCase = require('../../application/use-cases/LoginUseCase');
const { sendTokenCookie } = require('../../../../shared/utils/jwtHelper');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await loginUseCase.execute(email, password);
      sendTokenCookie(user, 200, res);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  }
}

module.exports = new AuthController();
