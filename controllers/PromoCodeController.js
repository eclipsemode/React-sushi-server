import PromoCodeService from '../service/PromoCodeService.js';
class PromoCodeController {
    async create(req, res, next) {
        try {
            const promoCode = await PromoCodeService.create(req.body);
            return res.status(200).json(promoCode);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const { page, size, match } = req.query;
            const promoCodes = await PromoCodeService.getAll({ page, size, match });
            return res.status(200).json(promoCodes);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const deletedMessage = await PromoCodeService.delete(req.body);
            return res.status(200).json(deletedMessage);
        }
        catch (error) {
            next(error);
        }
    }
    async change(req, res, next) {
        try {
            const newPromoCode = await PromoCodeService.change(req.body);
            return res.status(200).json(newPromoCode);
        }
        catch (error) {
            next(error);
        }
    }
    async use(req, res, next) {
        try {
            const newPromoCode = await PromoCodeService.use(req.body);
            return res.status(200).json({ status: 200, data: newPromoCode });
        }
        catch (error) {
            next(error);
        }
    }
    async check(req, res, next) {
        try {
            const promoCode = await PromoCodeService.check(req.body.code);
            return res.status(200).json(promoCode);
        }
        catch (error) {
            next(error);
        }
    }
}
export default new PromoCodeController();
//# sourceMappingURL=PromoCodeController.js.map