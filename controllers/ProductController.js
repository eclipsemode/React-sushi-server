import ProductService from '../service/ProductService.js';
class ProductController {
    async create(req, res, next) {
        try {
            const { image } = req.files;
            if (!image)
                return res.sendStatus(400);
            const product = await ProductService.create({ ...req.body, image });
            return res.json(product);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const result = await ProductService.delete(+req.params.id);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const { categoryId, sortBy, sortOrder } = req.query;
            const products = await ProductService.getAll({ categoryId, sortBy, sortOrder });
            return res.json(sortBy === 'rating' ? products.reverse() : products);
        }
        catch (e) {
            next(e);
        }
    }
    async change(req, res, next) {
        try {
            let image;
            if (req.files?.image) {
                image = req.files;
            }
            else {
                image = null;
            }
            const product = await ProductService.change({ ...req.body, image });
            return res.json(product);
        }
        catch (e) {
            next(e);
        }
    }
    async changeOrderIndex(req, res, next) {
        try {
            const { data } = req.body;
            const result = await ProductService.changeOrderIndex(data);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
export default new ProductController();
//# sourceMappingURL=ProductController.js.map