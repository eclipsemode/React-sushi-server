const PromoCodeService = require('../service/PromoCodeService');

class PromoCodeController {
    async create(req, res, next) {
        try {
            const foundCode = await PromoCodeService.findOne(req.body);

            const promoCode = await PromoCodeService.create(req.body);

            return res.status(200).json({ status: 200, data: promoCode, message: "Промокод успешно создан" });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const promoCodes = await PromoCodeService.getAll(req.body);
            return res.status(200).json({ status: 200, data: promoCodes });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PromoCodeController();