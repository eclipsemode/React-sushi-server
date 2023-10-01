import {Response, Request, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import OrderService from "../service/OrderService.js";

class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.create(req.body);
      return res.json(order);
    } catch (error) {
      next(error)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
    const orders = await OrderService.getAll();
    return res.json(orders);
    } catch (e) {
      next(ApiError.badRequest('Произошла ошибка.'))
    }
  }

  async getAllByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const {id, page, size} = req.query as unknown as {id: number, page: number, size: number}
      const orders = await OrderService.getAllByUserId(id, page, size);
      return res.json(orders);
    } catch (e) {
      next(ApiError.badRequest('Произошла ошибка.'));
    }
  }

  async changeStatusWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const {action, order_id, status, datetime} = req.body;
      const order = await OrderService.changeStatusWebhook(action, order_id, status, datetime);
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }
}

export default new OrderController();