const {User, Order, Product, Promocode} = require('../models/models');
const ApiError = require("../error/ApiError");
const PromoCodeService = require('../service/PromoCodeService');

class OrderService {
    async create(data) {
        let order;

        if (!data.orderProducts) {
            throw ApiError.badRequest('Отсутствуют товары', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.totalPrice) {
            throw ApiError.badRequest('Отсутствует итоговая стоимость', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.totalAmount) {
            throw ApiError.badRequest('Отсутствует общее количество товаров', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.type) {
            throw ApiError.badRequest('Отсутствует тип заказа', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.name) {
            throw ApiError.badRequest('Отсутствует имя', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.tel) {
            throw ApiError.badRequest('Отсутствует телефон', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!data.payment) {
            throw ApiError.badRequest('Отсутствует тип оплаты', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        if (data.payment !== 'cash' && data.payment !== 'card') {
            throw ApiError.badRequest('Неверный тип оплаты (Тип оплаты может иметь значение "card" или "cash")', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        if (data.type !== 'delivery' && data.type !== 'pickup') {
            throw ApiError.badRequest('Неверный тип заказа (Тип заказа может иметь значение "delivery" или "pickup")', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        const promoCode = await Promocode.findOne({
            where: {
                code: data.promocode
            }
        })

        if (!promoCode) {
            order = await Order.create(data);
        } else {
            await PromoCodeService.use(data.promocode);
            order = await Order.create(data);
        }

        return order;
    }

    async getAll() {
        const orders = await Order.findAll()
        return orders;
    }

    async getAllByUserId(id) {
        const orders = await Order.findAll({where: {userId: id}})
        return orders;
    }

    async changeStatus(id, status) {
        const order = await Order.findOne({
            where: {
                id
            }
        })

        if (!order) {
            throw ApiError.badRequest('Данного заказа не существует', [
                {
                    name: 'changeStatus',
                    description: 'Ошибка изменения статуса заказа'
                }
            ])
        }

        if (status !== 'new' && status !== 'production' && status !== 'produced' && status !== 'delivery' && status !== 'completed' && status !== 'deleted') {
            throw ApiError.badRequest('Неверное новое значение статуса', [
                {
                    name: 'changeStatus',
                    description: 'Ошибка изменения статуса заказа'
                }
            ])
        }

        order.status = status;
        order.save();

        return order;
    }

}

module.exports = new OrderService();