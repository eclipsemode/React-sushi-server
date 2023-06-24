const ApiError = require("../error/ApiError");
const fs = require('fs-extra');
const uuid = require("uuid");
const path = require("path");
const {Product} = require("../models/models");

class ProductService {
    async create({name, price, description, categoryId, rating, sku, orderIndex, type, size}, image, next) {

        if (!!type && type !== 'pizza' && type !== 'other') {
            throw ApiError.badRequest('Тип может быть "pizza" или "other"', [
                {
                    name: 'create',
                    description: 'Ошибка создания продукта'
                }
            ])
        }

        if (+rating > 10 || +rating < 1) {
            throw ApiError.badRequest('Неверные значения рейтинга', [
                {
                    name: 'create',
                    description: 'Ошибка создания продукта'
                }
            ])
        }

        if (type === 'pizza') {
            const priceArr = JSON.parse(price);
            const skuArr = !!sku ? JSON.parse(sku) : [];
            const sizeArr = !!size ? JSON.parse(size) : [];

            let fileName = uuid.v4() + ".jpg";
            image.mv(path.resolve(__dirname, "..", "static", fileName));

            const productPromises = priceArr.map(async (item, i) => {
                const newProduct = await Product.create({
                    name,
                    price: priceArr[i],
                    description,
                    rating: parseInt(rating),
                    categoryId: parseInt(categoryId),
                    image: fileName,
                    sku: !!skuArr[i] ? skuArr[i] : null,
                    orderIndex: !!orderIndex ? parseInt(orderIndex) : null,
                    type: !!type ? type : null,
                    size: !!sizeArr[i] ? sizeArr[i] : null
                });
                return newProduct;
            })

            const product = await Promise.all(productPromises);

            return product
        } else {
            let fileName = uuid.v4() + ".jpg";
            image.mv(path.resolve(__dirname, "..", "static", fileName));
            const product = await Product.create({
                name,
                price: JSON.parse(price),
                description,
                rating: parseInt(rating),
                categoryId: parseInt(categoryId),
                image: fileName,
                sku: !!sku ? JSON.parse(sku) : null,
                orderIndex: !!orderIndex ? parseInt(orderIndex) : null,
                type: !!type ? type : null
            });

            return product;
        }
    }

    async delete(id) {
        const foundProduct = await Product.findOne({
            where: {id}
        });

        if (!foundProduct) {
            throw ApiError.badRequest('Введите корректный id продукта', [
                {
                    name: 'delete',
                    description: 'Ошибка удаления продукта'
                }
            ])
        }

        if (foundProduct.type === 'pizza') {
            const foundPizzas = await Product.findAll({
                where: {
                    name: foundProduct.name
                }
            })

            if (foundPizzas.length === 1) {
                const imagePath = path.join(__dirname, '..', 'static', foundProduct.image);

                await fs.remove(imagePath);
                await Product.destroy({
                    where: {id}
                });
                return "Deleted successfully";
            } else {
                await Product.destroy({
                    where: {id}
                });
                return "Deleted successfully";
            }
        }

        const imagePath = path.join(__dirname, '..', 'static', foundProduct.image);

        await fs.remove(imagePath);
        await Product.destroy({
            where: {id}
        });
        return "Deleted successfully";
    }

    async deleteAllPizzaSize(id) {
        if (!id) {
            throw ApiError.badRequest('Введите id продукта', [
                {
                    name: 'deleteAllPizzaSize',
                    description: 'Ошибка удаления продуктов'
                }
            ])
        }

        const foundProduct = await Product.findOne({
            where: {id}
        })

        if (!foundProduct) {
            throw ApiError.badRequest('Данного продукта не существует', [
                {
                    name: 'deleteAllPizzaSize',
                    description: 'Ошибка удаления продуктов'
                }
            ])
        }

        const foundAllProducts = await Product.findAll({
            where: {
                name: foundProduct.name
            }
        });

        const imagePath = path.join(__dirname, '..', 'static', foundProduct.image);

        await fs.remove(imagePath);

        const deletePromises = foundAllProducts.map(async (item) => {
            return await Product.destroy({
                where: {
                    id: item?.id
                }
            })
        })

        await Promise.all(deletePromises);

        return 'Successfully deleted';
    }

    async getBySort({categoryId, sortBy, sortOrder}, next) {
        let products;
        if (categoryId) {
            if (!sortBy || !sortOrder) next(ApiError.badRequest("Не указана сортировка."));
            products = await Product.findAll({
                where: {categoryId},
                order: [
                    [sortBy, sortOrder]
                ]
            });
        } else {
            products = await Product.findAll();
        }
        return products;
    }

    async getAll() {
        return Product.findAll();
    }
}

module.exports = new ProductService();