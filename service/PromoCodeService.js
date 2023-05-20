const {Promocode} = require("../models/models");
const ApiError = require("../error/ApiError");

class PromoCodeService {
    async create({code, discount, type}) {
        if (!discount) {
            throw ApiError.badRequest('Ошибка создания промокода', [
                {
                    name: 'create',
                    description: 'Скидка не может быть пустой',
                },
            ]);
        }
        if (!code) {
            throw ApiError.badRequest('Ошибка создания промокода', [
                {
                    name: 'create',
                    description: 'Промокод не может быть пустым',
                },
            ]);
        }
        if (discount < 1 || discount > 5000) {
            throw ApiError.badRequest('Ошибка создания промокода', [
                {
                    name: 'create',
                    description: 'Недопустимые значения',
                },
            ]);
        }
        const promoCode = await Promocode.build();
        promoCode.setDataValue('code', code.toLowerCase());
        promoCode.setDataValue('type', type);
        promoCode.setDataValue('discount', discount);
        await promoCode.save();
        return promoCode;
    }

    async findOne({code}) {
        const foundCode = await Promocode.findOne({where: {code: code.toLowerCase()}});

        if (foundCode !== null) {
            throw ApiError.badRequest('Ошибка создания промокода', [
                {
                    name: 'findOne',
                    description: 'Данный промокод уже существует',
                },
            ]);
        }
        return foundCode;
    }

    async getAll() {
        const promoCodes = await Promocode.findAll();
        if (promoCodes.length === 0) {
            throw ApiError.internal('Ошибка получения промокодов', [
                {
                    name: 'getAll',
                    description: 'Промокоды отсутствуют'
                }
            ])
        }

        return promoCodes;
    }
}

module.exports = new PromoCodeService();