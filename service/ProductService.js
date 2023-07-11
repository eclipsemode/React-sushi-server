const ApiError = require("../error/ApiError");
const fs = require('fs-extra');
const uuid = require("uuid");
const path = require("path");
const {Product, ProductSize, OrderProduct} = require("../models/models");

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

        const products = await Product.findAll();
        let fileName = uuid.v4() + ".jpg";
        await image.mv(path.resolve(__dirname, "..", "static", fileName));
        const product = await Product.create({
            name,
            rating,
            description,
            image: fileName,
            orderIndex: orderIndex ?? products.length + 1,
            type,
            categoryId
        })


        const parsedSize = size ? JSON.parse(size) : null;
        const parsedPrice = JSON.parse(price);
        const parsedSku = sku ? JSON.parse(sku) : null;


        const sizePromises = parsedPrice.map(async (_, index) => {
            return await ProductSize.create({
                size: parsedSize ? parsedSize[index] : null,
                price: parsedPrice[index],
                sku: parsedSku ? parsedSku[index] : null,
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

        await OrderProduct.update(
            { image: 'images/not-found-product.jpg' },
            { where: { image: foundProduct.image } }
        )

        await Product.destroy({
            where: {id}
        });

        return "Deleted successfully";
    }

    async getAll({categoryId, sortBy, sortOrder}, next) {
        let products;

        if (!!categoryId) {
            if (!sortBy || !sortOrder) next(ApiError.badRequest("Не указана сортировка."));

            if (sortBy === 'price') {
                products = await Product.findAll({
                    include: [{model: ProductSize, as: 'sizes', required: true}],
                    where: {categoryId},
                    order: [
                        ['sizes', sortBy, sortOrder]
                    ]
                });
            } else {
                products = await Product.findAll({
                    include: [{model: ProductSize, as: 'sizes'}],
                    where: {categoryId},
                    order: [
                        [sortBy, sortOrder]
                    ]
                });
            }

        } else {
            products = await Product.findAll({
                include: [{model: ProductSize, as: 'sizes'}],
                order: [
                    ['orderIndex', 'ASC']
                ]
            });
        }

        const parsedData = products.reduce((previousValue, currentValue, currentIndex, array) => {
            return [...previousValue, currentValue.sizes.map(item => {
                return {
                    id: currentValue.id,
                    name: currentValue.name,
                    rating: currentValue.rating,
                    description: currentValue.description,
                    categoryId: currentValue.categoryId,
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
        const allProducts = Product.findAll();
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

        const parsedSize = size ?  JSON.parse(size) : null;
        const parsedPrice = JSON.parse(price);
        const parsedSku = sku ? JSON.parse(sku) : null;

        const sizePromises = parsedPrice.map(async (_, index) => {
            return await ProductSize.create({
                size: parsedSize ? parsedSize[index] : null,
                price: parsedPrice[index],
                sku: parsedSku ? parsedSku[index] : null,
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
        foundProduct.orderIndex = orderIndex ? orderIndex : (await allProducts).length  === 1 ? 1 : (await allProducts).length + 1;
        foundProduct.type = type ? type : foundProduct.type;
        foundProduct.categoryId = categoryId;
        foundProduct.save();

        const mergedData = {
            ...foundProduct.dataValues,
            sizes: newSizes
        }

        return mergedData;
    }

    async changeOrderIndex(data) {
        if (!data || !Array.isArray(data)) {
            throw ApiError.badRequest('Отправьте корректные данные', [
                {
                    name: 'changeOrderIndex',
                    description: 'Ошибка изменения индекса продуктов'
                }
            ])
        }

        const dataPromises = data.map(async (item) => {
            return await Product.update({ orderIndex: item.orderIndex }, {
                where: {
                    id: item.id
                }
            })
        })

        await Promise.all(dataPromises);

        return 'Successfully changed';

    }
}

module.exports = new ProductService();