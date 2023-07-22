const ApiError = require('../error/ApiError');
const CategoryService = require('../service/CategoryService');

class CategoryController {
  async create(req, res, next) {
    try {
      const {name} = req.body;
      const {image} = req.files;
      const category = await CategoryService.create(name, image)
      return res.json(category);
    } catch (e) {
      next(e);
    }
  }

  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAll();
      return res.json(categories);
    } catch (e) {
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await CategoryService.delete(req.params.id)
      return res.status(200).json( result );
    } catch (e) {
      next(e);
    }
  }

  async change(req, res, next) {
    try {
      let image;
      if (req.files && req.files.image) {
        image = req.files.image
      }
      const {id, name} = req.body;
      const result = await CategoryService.change(id, name, image);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async changeOrder(req, res, next) {
    try {
      const {data} = req.body;
      const result = await CategoryService.changeOrder(data);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new CategoryController();