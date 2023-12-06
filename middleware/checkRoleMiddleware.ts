import {Response, Request, NextFunction} from "express";
import TokenService from '../service/TokenService.js';

import ApiError from "../error/ApiError.js";
import {UserType} from "../models/types.js";

export default function(role: UserType) {
  return function (req: Request, res: Response, next: NextFunction) {
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

      const token = req.headers.authorization?.split(' ').at(1)
      if (!token) {
        return next(ApiError.unauthorized('Не авторизован', [
          {
            name: 'checkRoleMiddleware',
            description: 'Необходимо авторизоваться',
          },
        ]));
      }
      const decoded = TokenService.validateAccessToken(token);
      if (decoded?.role !== role) {
        return next(ApiError.badRequest('Нет доступа', [
          {
            name: 'checkRoleMiddleware',
            description: JSON.stringify(decoded),
          },
        ]));
      }
      // @ts-ignore
      req.user = decoded;
      next()
    } catch (e) {
      return next(e)
    }
  };
}