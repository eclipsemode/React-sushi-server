import ApiError from "../error/ApiError.js";
import OrderService from "../service/OrderService.js";
class OrderController {
    async create(req, res, next) {
        try {
            const order = await OrderService.create(req.body);
            return res.json(order);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const orders = await OrderService.getAll();
            return res.json(orders);
        }
        catch (e) {
            next(ApiError.badRequest('Произошла ошибка.'));
        }
    }
    async getAllByUserId(req, res, next) {
        try {
            const { id, page, size } = req.query;
            const orders = await OrderService.getAllByUserId(id, page, size);
            return res.json(orders);
        }
        catch (e) {
            next(ApiError.badRequest('Произошла ошибка.'));
        }
    }
    async changeStatusWebhook(req, res, next) {
        try {
            const { action, order_id, status, datetime } = req.body;
            const order = await OrderService.changeStatusWebhook(action, order_id, status, datetime);
            return res.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }
}
export default new OrderController();
//# sourceMappingURL=OrderController.js.map