const { Category } = require("../models/models");
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError");
const fs = require('fs-extra');

class CategoryService {
  async create(name, image) {
    let fileName = uuid.v4() + ".jpg";
    await image.mv(path.resolve(__dirname, "..", "static/images/category", fileName));
    const category = await Category.create({name, image: fileName});
    return category;
  }

  async getAll() {
    const categories = await Category.findAll();
    return categories;
  }

  async delete(id) {

    if (!id) {
      throw ApiError.badRequest('Введите "id" категории', [
        {
          name: 'delete',
          description: 'Ошибка удаления категории'
        }
      ])
    }


    const foundCategory = await Category.findOne({
      where: {id}
    })


    if (!foundCategory) {
      throw ApiError.badRequest('Категория не найдена', [
        {
          name: 'delete',
          description: 'Ошибка удаления категории'
        }
      ])
    }

    const imagePath = path.join(__dirname, '..', 'static/images/category', foundCategory.image);
    await fs.remove(imagePath);

    await Category.destroy({
      where: { id }
    })
    return 'Deleted successfully';
  }
}

module.exports = new CategoryService();