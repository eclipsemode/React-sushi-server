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

    async delete(req, res, next) {
        try {
            const deletedMessage = await PromoCodeService.delete(req.body)
            return res.status(200).json({status: 200, message: deletedMessage});
        } catch (error) {
            next(error)
        }
    }

    async change(req, res,next) {
        try {
            const newPromoCode = await PromoCodeService.change(req.body)
            return res.status(200).json({status: 200, data: newPromoCode});
        } catch (error) {
            next(error)
        }
    }

    async use(req, res,next) {
        try {
            const newPromoCode = await PromoCodeService.use(req.body)
            return res.status(200).json({status: 200, data: newPromoCode});
        } catch (error) {
            next(error)
        }
    }

    async check(req, res, next) {
        try {
            const promoCode = await PromoCodeService.check(req.body.code)
            return res.status(200).json({promoCode});
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PromoCodeController();