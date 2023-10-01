import {Response, Request, NextFunction} from "express";
import PromoCodeService, {IGetAll} from '../service/PromoCodeService.js';

class PromoCodeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const promoCode = await PromoCodeService.create(req.body);
            return res.status(200).json(promoCode);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, size, match } = req.query as unknown as IGetAll;
            const promoCodes = await PromoCodeService.getAll({page, size, match});
            return res.status(200).json(promoCodes);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const deletedMessage = await PromoCodeService.delete(req.body)
            return res.status(200).json(deletedMessage);
        } catch (error) {
            next(error)
        }
    }

    async change(req: Request, res: Response, next: NextFunction) {
        try {
            const newPromoCode = await PromoCodeService.change(req.body)
            return res.status(200).json(newPromoCode);
        } catch (error) {
            next(error)
        }
    }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const newPromoCode = await PromoCodeService.use(req.body)
            return res.status(200).json({status: 200, data: newPromoCode});
        } catch (error) {
            next(error)
        }
    }

    async check(req: Request, res: Response, next: NextFunction) {
        try {
            const promoCode = await PromoCodeService.check(req.body.code)
            return res.status(200).json(promoCode);
        } catch (error) {
            next(error)
        }
    }
}

export default new PromoCodeController();