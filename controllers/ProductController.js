const ProductService = require('../service/ProductService');

class ProductController {
  async create(req, res, next) {
    try {
      const product = await ProductService.create(req.body, req.files.image)
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

  async getAll(req, res, next) {
    try {
      const { sortBy } = req.query;
      const products = await ProductService.getAll(req.query, next)
      return res.json(sortBy === 'rating' ? products.reverse() : products);
    } catch (e) {
      next(e);
    }
  }

  async change(req, res, next) {
    try {
      let image = null;
      if (req.files) {
        image = req.files.image;
      }
      const {id, name, price, description, categoryId, rating, sku, orderIndex, type, size} = req.body;
      const product = await ProductService.change(id, name, price, description, categoryId, rating, sku, orderIndex, type, size, image);
      return res.json(product);
    } catch (e) {
      next(e);
    }
  }

}

module.exports = new ProductController();