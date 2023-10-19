import {Response, Request, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import UserService from "../service/UserService.js";
import { validationResult } from "express-validator";

class UserController {
  async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const {tel} = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.badRequest("Ошибка валидации.", [{name: 'Validation Error', description: errors.array().toString()}]));
      }
      const user = await UserService.auth(tel);
      return res.json(user);
    } catch (e) {
      return next(e);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, requestId } = req.body;
      const confirm = await UserService.confirm(code, requestId);
      res.cookie("refreshToken", confirm.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(confirm);
    } catch (e) {
      return next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json("Successfully logged out.");
    } catch (e) {
      return next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies as unknown as {refreshToken: string};
      const userData = await UserService.refreshToken(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      return next(e);
    }
  }

  async getUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies as unknown as {refreshToken: string};
      const user = await UserService.getUserData(refreshToken);
      return res.json(user);
    } catch (e) {
      return next(e);
    }
  }

  async patchUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.patchUserData(req.body);
      return res.json({ user });
    } catch (e) {
      return next(e);
    }
  }
}

export default new UserController();