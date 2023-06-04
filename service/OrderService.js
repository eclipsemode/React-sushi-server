const { User, Order, Product, Promocode } = require('../models/models');
const ApiError = require("../error/ApiError");
const PromoCodeService = require('../service/PromoCodeService');

class OrderService {
  async create(data) {
    let order;
    const promoCode = await PromoCodeService.check(data.promocode)

    if (!promoCode) {
        order = await Order.create({
          ...data,
          promocode: null
        })
    } else {
      await PromoCodeService.use(data.promocode);
      order = await Order.create(data)
    }

    return order;
  }

  async getAll() {
    const orders = await Order.findAll()
    return orders;
  }

  async getAllByUserId(id) {
    const orders = await Order.findAll({where: { userId: id }})
    return orders;
  }
}

module.exports = new OrderService();