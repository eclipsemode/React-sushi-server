const { Order, Product, Promocode, OrderProduct, Bonus, User, Branch} = require('../models/models');
const ApiError = require("../error/ApiError");
const PromoCodeService = require('../service/PromoCodeService');

class OrderService {
    async create(userId, orderId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, products, branchId) {

        let order;
        let orderProducts = [];

        if (products.length === 0) {
            throw ApiError.badRequest('Отсутствуют товары', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!totalPrice) {
            throw ApiError.badRequest('Отсутствует итоговая стоимость', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!totalAmount) {
            throw ApiError.badRequest('Отсутствует общее количество товаров', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!type) {
            throw ApiError.badRequest('Отсутствует тип заказа', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!name) {
            throw ApiError.badRequest('Отсутствует имя', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!tel) {
            throw ApiError.badRequest('Отсутствует телефон', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        } else if (!payment) {
            throw ApiError.badRequest('Отсутствует тип оплаты', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        if (payment !== 'cash' && payment !== 'card') {
            throw ApiError.badRequest('Неверный тип оплаты (Тип оплаты может иметь значение "card" или "cash")', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        if (type !== 'delivery' && type !== 'pickup') {
            throw ApiError.badRequest('Неверный тип заказа (Тип заказа может иметь значение "delivery" или "pickup")', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        const foundBranch = await Branch.findOne({
            where: {
                id: branchId
            }
        })

        if (!foundBranch) {
            throw ApiError.badRequest('Отсутствует "id" филиала', [
                {
                    name: 'create',
                    description: 'Ошибка создания заказа'
                }
            ])
        }

        const foundPromoCode = await Promocode.findOne({
            where: {
                code: promocode
            }
        })

        if (!foundPromoCode) {
            order = await Order.create({userId, orderId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, branchId: foundBranch.id});
            const productsPromises = products.map(async (item) => {
                return await OrderProduct.create({
                    ...item,
                    orderId: order.id
                });
            })

            orderProducts = await Promise.all(productsPromises);

        } else {
            await PromoCodeService.use(promocode);
            order = await Order.create({userId, totalPrice, totalAmount, type, name, address, entrance, floor, room, tel, email, day, time, utensils, payment, commentary, promocode, status, branchId: foundBranch.id});

            const productsPromises = products.map(async (item) => {
                return await OrderProduct.create({
                    ...item,
                    orderId: order.id
                });
            })

            orderProducts = await Promise.all(productsPromises);
        }

        await Bonus.create({
            orderId: order.id
        })

        return {
            ...order.dataValues,
            orderProducts
        };
    }

    async getAll() {
        const orders = await Order.findAll({
            include: [{ model: OrderProduct, as: 'products' }]
        })
        return orders;
    }

    async getAllByUserId(id) {
        const orders = await Order.findAll({
            where: {
                userId: id
            },
            include: [{ model: OrderProduct, as: 'products' }]
        });
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

    async changeStatusWebhook(action, order_id, status, datetime) {
        const order = await Order.findOne({
            where: {
                orderId: order_id
            }
        })

        if (!order) {
            throw ApiError.badRequest('Данного заказа не существует', [
                {
                    name: 'changeStatusWebhook',
                    description: 'Ошибка изменения статуса заказа'
                }
            ])
        }

        const bonus = await Bonus.findOne({
            where: {
                orderId: order.id
            }
        });

        if (!bonus) {
            throw ApiError.badRequest('Отсутствует бонусный счет заказа', [
                {
                    name: 'changeStatusWebhook',
                    description: 'Ошибка изменения статуса заказа'
                }
            ])
        }

        const user = await User.findOne({
            where: {
                id: order.userId
            }
        })

        const bonusScore = order.totalPrice / 100;

        switch (status) {
            case 1:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'new';
                bonus.score = 0;
                break;
            case 3:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'production';
                bonus.score = 0;
                break;
            case 13:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'accepted';
                bonus.score = 0;
                break;
            case 12:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'produced';
                bonus.score = 0;
                break;
            case 4:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'delivery';
                bonus.score = 0;
                break;
            case 11:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'deleted';
                bonus.score = 0;
                break;
            case 10:
                if (user && order.status !== 'completed') {
                    user.bonus = user.bonus + bonusScore;
                    user.save();
                }
                order.status = 'completed';
                bonus.score = bonusScore;
                break;
            default:
                if (user && order.status === 'completed') {
                    user.bonus = user.bonus - bonusScore;
                    user.save();
                }
                order.status = 'new';
                bonus.score = 0;
        }

        bonus.save();
        order.save();
        return order;
    }

}

module.exports = new OrderService();