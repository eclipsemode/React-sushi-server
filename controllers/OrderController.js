const ApiError = require('../error/ApiError');
const OrderService = require('../service/OrderService');

class OrderController {
  async create(req, res, next) {
    try {
      const {userId, orderId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, products, branchId} = req.body;
      const order = await OrderService.create(userId, orderId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, products, branchId);
      return res.json(order);
    } catch (error) {
      next(error)
    }
  }

  async getAll(req, res, next) {
    try {
    const orders = await OrderService.getAll();
    return res.json(orders);
    } catch (e) {
      next(ApiError.badRequest('Произошла ошибка.'))
    }
  }

  async getAllByUserId(req, res, next) {
    try {
      const { id } = req.params;
      const orders = await OrderService.getAllByUserId(id);
      return res.json(orders);
    } catch (e) {
      next(ApiError.badRequest('Произошла ошибка.'));
    }
  }

  async changeStatusWebhook(req, res, next) {
    try {
      const {action, order_id, status, datetime} = req.body;
      const order = await OrderService.changeStatusWebhook(action, order_id, status, datetime);
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new OrderController();