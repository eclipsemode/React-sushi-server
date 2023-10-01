import fileUpload from "express-fileupload";
import {Category, Product} from '../models/models.js';
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import ApiError from '../error/ApiError.js'
import fs from 'fs-extra'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

class CategoryService {
  async create(name: string, image: fileUpload.UploadedFile) {
    const allCategories = await Category.findAll();
    let fileName = uuidv4() + ".jpg";
    await image.mv(path.resolve(__dirname, "..", "static/images/category", fileName));
    const category = await Category.create({name, image: fileName, orderIndex: allCategories.length + 1});
    return category;
  }

  async getAll() {
    const categories = await Category.findAll({
      order: [
        ['orderIndex', 'asc']
      ]
    });
    return categories;
  }

  async delete(id: number) {

    if (!id) {
      throw ApiError.badRequest('Введите "id" категории', [
        {
          name: 'delete',
          description: 'Ошибка удаления категории'
        }
      ])
    }

    const foundProductsInCategory = await Product.findOne({
      where: {
        categoryId: id
      }
    })

    if (foundProductsInCategory) {
      throw ApiError.badRequest('В категории присутствуют товары, удаление невозможно', [
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

  async change(id: number, name: string, image: fileUpload.UploadedFile){
    if (!id) {
      throw ApiError.badRequest('Введите "id" категории', [
        {
          name: 'change',
          description: 'Ошибка изменения категории'
        }
      ])
    }

    if (!name) {
      throw ApiError.badRequest('Введите "name" категории', [
        {
          name: 'change',
          description: 'Ошибка изменения категории'
        }
      ])
    }


    const foundCategory = await Category.findOne({
      where: {
        id
      }
    })

    if (!foundCategory) {
      throw ApiError.badRequest('Категория не найдена', [
        {
          name: 'change',
          description: 'Ошибка изменения категории'
        }
      ])
    }

    foundCategory.name = name;
    if (image) {
      const fileName = uuidv4() + ".jpg";
      await image.mv(path.resolve(__dirname, "..", "static/images/category", fileName));
      if (foundCategory.image) {
        fs.remove(path.resolve(__dirname, "..", "static/images/category", foundCategory.image))
      }
      foundCategory.image = fileName;
    }
    await foundCategory.save();

    return await foundCategory;
  }

  async changeOrder(data: Category[]) {
    if (!data) {
      throw ApiError.badRequest('Отсутствует массив категорий', [
        {
          name: 'changeOrder',
          description: 'Ошибка изменения порядка категории'
        }
      ])
    }

    const categoryPromises = data.map(async (item, index) => {
      return await Category.update({orderIndex: index + 1}, {
        where: {id: item.id}
      })
    })

    await Promise.all(categoryPromises);

    return 'Successfully changed';
  }
}

export default new CategoryService()