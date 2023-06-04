const TokenService = require('../service/TokenService');
const ApiError = require("../error/ApiError");

module.exports = function(role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next()
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.includes("Bearer ")) {
        return next(
            ApiError.unauthorized("Не авторизован", [
              {
                name: "checkRoleMiddleware",
                description: "Отсутствуют заголовки",
              },
            ])
        );
      }

      const token = req.headers.authorization.split(' ').at(1)
      if (!token) {
        return next(ApiError.unauthorized('Не авторизован', [
          {
            name: 'checkRoleMiddleware',
            description: 'Необходимо авторизоваться',
          },
        ]));
      }
      const decoded = TokenService.validateAccessToken(token);
      if (decoded.role !== role) {
        return next(ApiError.badRequest('Нет доступа', [
          {
            name: 'checkRoleMiddleware',
            description: 'Нет доступа',
          },
        ]));
      }
      req.user = decoded;
      next()
    } catch (e) {
      return next(e)
    }
  };
}