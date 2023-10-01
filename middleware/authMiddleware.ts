import {Response, Request, NextFunction} from "express";
import ApiError from '../error/ApiError.js';
import TokenService from '../service/TokenService.js';

export default function (req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization?.split(' ').at(1)
    if (!token) {
      return next(ApiError.unauthorized());
    }
    const tokenData = TokenService.validateAccessToken(token);
    if (!tokenData) {
      return next(ApiError.unauthorized());
    }
    // @ts-ignore
    req.user = tokenData
    next();
  } catch (e) {
    return next(e);
  }
};