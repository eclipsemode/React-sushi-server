import sequelize from "../db.js";
import { Category, Product } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import FsService from "./FsService.js";
class CategoryService {
    async create(name, image) {
        return sequelize.transaction(async (t) => {
            const allCategories = await Category.findAll();
            const fileName = await FsService.CreateImage(image, 'images/category');
            const category = await Category.create({
                name,
                image: fileName,
                orderIndex: allCategories.length + 1
            }, { transaction: t });
            return category;
        });
    }
    async getAll() {
        const categories = await Category.findAll({
            order: [
                ['orderIndex', 'asc']
            ]
        });
        return categories;
    }
    async delete(id) {
        return sequelize.transaction(async (t) => {
            if (!id) {
                throw ApiError.badRequest('Введите "id" категории', [
                    {
                        name: 'delete',
                        description: 'Ошибка удаления категории'
                    }
                ]);
            }
            const foundProductsInCategory = await Product.findOne({
                where: {
                    categoryId: id
                }
            });
            if (foundProductsInCategory) {
                throw ApiError.badRequest('В категории присутствуют товары, удаление невозможно', [
                    {
                        name: 'delete',
                        description: 'Ошибка удаления категории'
                    }
                ]);
            }
            const foundCategory = await Category.findOne({
                where: { id }
            });
            if (!foundCategory) {
                throw ApiError.badRequest('Категория не найдена', [
                    {
                        name: 'delete',
                        description: 'Ошибка удаления категории'
                    }
                ]);
            }
            await FsService.DeleteImage(foundCategory.image, 'static/images/category');
            await Category.destroy({
                where: { id },
                transaction: t
            });
            return 'Deleted successfully';
        });
    }
    async change(id, name, image) {
        if (!id) {
            throw ApiError.badRequest('Введите "id" категории', [
                {
                    name: 'change',
                    description: 'Ошибка изменения категории'
                }
            ]);
        }
        if (!name) {
            throw ApiError.badRequest('Введите "name" категории', [
                {
                    name: 'change',
                    description: 'Ошибка изменения категории'
                }
            ]);
        }
        const foundCategory = await Category.findOne({
            where: {
                id
            }
        });
        if (!foundCategory) {
            throw ApiError.badRequest('Категория не найдена', [
                {
                    name: 'change',
                    description: 'Ошибка изменения категории'
                }
            ]);
        }
        foundCategory.name = name;
        if (image) {
            const fileName = await FsService.ChangeImage(foundCategory.image, image, 'static/images/category');
            if (fileName)
                foundCategory.image = fileName;
        }
        await foundCategory.save();
        return await foundCategory;
    }
    async changeOrder(data) {
        return sequelize.transaction(async (t) => {
            if (!data) {
                throw ApiError.badRequest('Отсутствует массив категорий', [
                    {
                        name: 'changeOrder',
                        description: 'Ошибка изменения порядка категории'
                    }
                ]);
            }
            const categoryPromises = data.map(async (item, index) => {
                return await Category.update({ orderIndex: index + 1 }, {
                    where: { id: item.id },
                    transaction: t
                });
            });
            await Promise.all(categoryPromises);
            return 'Successfully changed';
        });
    }
}
export default new CategoryService();
//# sourceMappingURL=CategoryService.js.map