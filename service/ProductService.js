const ApiError = require("../error/ApiError");
const fs = require('fs-extra');
const uuid = require("uuid");
const path = require("path");
const {Product, ProductSize} = require("../models/models");
const {DataTypes} = require("sequelize");

class ProductService {
    async create({name, price, description, categoryId, rating, sku, orderIndex, type, size}, image) {

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

        let fileName = uuid.v4() + ".jpg";
        await image.mv(path.resolve(__dirname, "..", "static", fileName));
        const product = await Product.create({
            name,
            rating,
            description,
            image: fileName,
            orderIndex,
            type,
            categoryId
        })

        const parsedSize = JSON.parse(size);
        const parsedPrice = JSON.parse(price);
        const parsedSku = JSON.parse(sku);


        const sizePromises = parsedSize.map(async (_, index) => {
            return await ProductSize.create({
                size: parsedSize[index],
                price: parsedPrice[index],
                sku: parsedSku[index],
                productId: product.id
            })
        })

        const productSizes = await Promise.all(sizePromises);

        const productSizeObj = productSizes;
        const productObj = product;
        const mergedData = {
            ...productObj.dataValues,
            sizes: productSizeObj
        }

        return mergedData;
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

        const imagePath = path.join(__dirname, '..', 'static', foundProduct.image);

        await fs.remove(imagePath);
        await Product.destroy({
            where: {id}
        });
        return "Deleted successfully";
    }

    async getAll({categoryId, sortBy, sortOrder}, next) {
        let products;

        if (!!categoryId) {
            if (!sortBy || !sortOrder) next(ApiError.badRequest("Не указана сортировка."));
            products = await Product.findAll({
                include: [{model: ProductSize, as: 'sizes'}],
                where: {categoryId},
                order: [
                    [sortBy, sortOrder]
                ]
            });
        } else {
            products = await Product.findAll({
                include: [{model: ProductSize, as: 'sizes'}]
            });
        }

        const parsedData = products.reduce((previousValue, currentValue, currentIndex, array) => {
            return [...previousValue, currentValue.sizes.map(item => {
                return {
                    id: currentValue.id,
                    name: currentValue.name,
                    rating: currentValue.rating,
                    description: currentValue.description,
                    image: currentValue.image,
                    orderIndex: currentValue.orderIndex,
                    type: currentValue.type,
                    sizeId: item.id,
                    size: item.size,
                    price: item.price,
                    sku: item.sku,
                }
            })]
        }, [])

        return parsedData;
    }

    async change(id, name, price, description, categoryId, rating, sku, orderIndex, type, size, image) {
        const foundProduct = await Product.findOne({
            where: {id},
            include: [{model: ProductSize, as: 'sizes'}]
        })

        await ProductSize.destroy({
            where: {productId: id}
        })

        if (!foundProduct) {
            throw ApiError.badRequest('Введите корректный id продукта', [
                {
                    name: 'change',
                    description: 'Ошибка изменения продукта'
                }
            ])
        }

        const parsedSize = JSON.parse(size);
        const parsedPrice = JSON.parse(price);
        const parsedSku = JSON.parse(sku).length > 0 ? JSON.parse(sku) : null;

        const sizePromises = parsedSize.map(async (_, index) => {
            return await ProductSize.create({
                size: parsedSize[index],
                price: parsedPrice[index],
                sku: parsedSku[index],
                productId: foundProduct.id
            })
        })

        const newSizes = await Promise.all(sizePromises);

        foundProduct.name = name;
        foundProduct.rating = rating;
        foundProduct.description = description;
        if (image) {
            const imagePath = path.join(__dirname, '..', 'static', foundProduct.image);
            await fs.remove(imagePath);

            let fileName = uuid.v4() + ".jpg";
            await image.mv(path.resolve(__dirname, "..", "static", fileName));

            foundProduct.image = fileName;
        }
        foundProduct.orderIndex = orderIndex;
        foundProduct.type = type;
        foundProduct.categoryId = categoryId;
        foundProduct.save();

        const mergedData = {
            ...foundProduct.dataValues,
            sizes: newSizes
        }

        return mergedData;
    }
}

module.exports = new ProductService();