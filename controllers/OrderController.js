const ApiError = require('../error/ApiError');
const OrderService = require('../service/OrderService');

class OrderController {
  async create(req, res, next) {
    try {
      const {userId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, products} = req.body;
      const order = await OrderService.create(userId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, products);
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

  async changeStatus(req, res, next) {
    try {
      const { id, status } = req.body;
      const order = await OrderService.changeStatus(id, status);
      return res.json(order);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new OrderController();