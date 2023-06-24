const ProductService = require('../service/ProductService');

class ProductController {
  async create(req, res, next) {
    try {
      const product = await ProductService.create(req.body, req.files.image, next)
      return res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ProductService.delete(req.params.id)
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteAllPizzaSize(req, res, next) {
    try {
      const result = await ProductService.deleteAllPizzaSize(req.params.id);
      return res.status(200).json(result)
    } catch (e) {
      next(e);
    }
  }

  async getBySort(req, res, next) {
    try {
      const { sortBy } = req.query;
      const products = await ProductService.getBySort(req.query, next)
      return res.json(sortBy === 'rating' ? products.reverse() : products);
    } catch (e) {
      next(e);
    }
  }

  async getAll(req, res,next) {
    try {
      const products = await ProductService.getAll();
      return res.json(products);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ProductController();