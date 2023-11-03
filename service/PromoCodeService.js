import { Op } from 'sequelize';
import { Promocode } from "../models/models.js";
import ApiError from "../error/ApiError.js";
class PromoCodeService {
    async create({ code, discount, type, limit }) {
        if (type !== 'RUB' && type !== 'percent') {
            throw ApiError.badRequest('Неверный тип промокода', [
                {
                    name: 'create',
                    description: 'Тип может иметь значение "RUB" или "percent"'
                },
            ]);
        }
        if (limit !== 'infinite' && !parseInt(String(limit))) {
            throw ApiError.badRequest('Неверный лимит промокода', [
                {
                    name: 'create',
                    description: 'Лимит может иметь числовое значение или "infinite"'
                },
            ]);
        }
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
        promoCode.setDataValue('limit', limit);
        await promoCode.save();
        return promoCode;
    }
    async findOne({ code }) {
        const foundCode = await Promocode.findOne({ where: { code: code.toLowerCase() } });
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
    async getAll({ page, size, match }) {
        const promoCodes = await Promocode.findAndCountAll({
            limit: size || undefined,
            offset: (page - 1) * size || undefined,
            order: [
                ['code', 'asc']
            ],
            where: {
                code: {
                    [Op.like]: '%' + (!match ? '' : match) + '%'
                }
            }
        });
        return promoCodes;
    }
    async delete({ code }) {
        const foundCode = await Promocode.findOne({ where: { code: code.toLowerCase() } });
        if (!foundCode) {
            throw ApiError.internal('Промокод не найден', [
                {
                    name: 'delete',
                    description: 'Промокоды отсутствуют'
                }
            ]);
        }
        await Promocode.destroy({
            where: {
                id: foundCode.id
            }
        });
        return 'Промокод успешно удален';
    }
    async change({ code, newValue }) {
        const foundCode = await Promocode.findOne({ where: { code: code.toLowerCase() } });
        if (!newValue) {
            throw ApiError.internal('Новое значение отсутствует', [
                {
                    name: 'change',
                    description: 'Введите новое значение'
                }
            ]);
        }
        if (!foundCode) {
            throw ApiError.internal('Промокод не найден', [
                {
                    name: 'change',
                    description: 'Промокоды отсутствуют'
                }
            ]);
        }
        foundCode.limit = +newValue;
        await foundCode.save();
        return foundCode;
    }
    async use(code) {
        const foundCode = await Promocode.findOne({ where: { code: code.toLowerCase() } });
        if (!foundCode) {
            throw ApiError.badRequest('Промокод не найден', [
                {
                    name: 'use',
                    description: 'Промокоды отсутствуют'
                }
            ]);
        }
        if (+foundCode.limit < 1) {
            throw ApiError.internal('Промокод не может быть использован', [
                {
                    name: 'use',
                    description: 'Лимит промокода истрачен'
                }
            ]);
        }
        if (foundCode.type === 'RUB' || foundCode.type === 'percent') {
            if (foundCode.limit !== 'infinite') {
                foundCode.limit = foundCode.limit - 1;
                if (foundCode.limit < 1) {
                    await Promocode.destroy({
                        where: {
                            id: foundCode.id
                        }
                    });
                }
                else {
                    await foundCode.save();
                }
            }
        }
        else {
            throw ApiError.badRequest('Неверный тип промокода', [
                {
                    name: 'use',
                    description: 'Тип может иметь значение "RUB" или "percent"'
                },
            ]);
        }
        return 'Промокод успешно использован';
    }
    async check(code) {
        if (!code) {
            throw ApiError.internal('Промокод отсутствует', [
                {
                    name: 'check',
                    description: 'Введите промокод'
                }
            ]);
        }
        const foundCode = await Promocode.findOne({
            where: {
                code: code.toLowerCase()
            }
        });
        if (!foundCode) {
            throw ApiError.internal('Промокод не найден', [
                {
                    name: 'check',
                    description: 'Введите правильный промокод'
                }
            ]);
        }
        if (+foundCode.limit < 1) {
            throw ApiError.internal('Промокод не может быть использован', [
                {
                    name: 'check',
                    description: 'Лимит промокода истрачен'
                }
            ]);
        }
        return foundCode;
    }
}
export default new PromoCodeService();
//# sourceMappingURL=PromoCodeService.js.map