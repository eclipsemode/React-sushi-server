import ApiError from "../error/ApiError.js";
import UserService from "../service/UserService.js";
import { validationResult } from "express-validator";
class UserController {
    async auth(req, res, next) {
        try {
            const { tel } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest("Ошибка валидации.", [{ name: 'Validation Error', description: errors.array().toString() }]));
            }
            const user = await UserService.auth(tel);
            return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    }
    async confirm(req, res, next) {
        try {
            const { code, requestId } = req.body;
            const confirm = await UserService.confirm(code, requestId);
            res.cookie("refreshToken", confirm.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(confirm);
        }
        catch (e) {
            return next(e);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie("refreshToken");
            return res.json("Successfully logged out.");
        }
        catch (e) {
            return next(e);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await UserService.refreshToken(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        }
        catch (e) {
            return next(e);
        }
    }
    async getUserData(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const user = await UserService.getUserData(refreshToken);
            return res.json(user);
        }
        catch (e) {
            return next(e);
        }
    }
    async patchUserData(req, res, next) {
        try {
            const user = await UserService.patchUserData(req.body);
            return res.json({ user });
        }
        catch (e) {
            return next(e);
        }
    }
}
export default new UserController();
//# sourceMappingURL=UserController.js.map