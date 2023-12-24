import ApiError from '../error/ApiError.js';
import {OrderProduct, Product, ProductSize} from '../models/models.js';
import {UploadedFile} from "express-fileupload";
import sequelize from "../db.js";
import FsService from "./FsService.js";

export interface ProductType extends Omit<Product & ProductSize, 'image'> {
    image: UploadedFile
}

export interface IGetProducts {
    categoryId: number,
    sortBy: 'price' | 'orderIndex' | 'rating' | 'name',
    sortOrder: 'asc' | 'desc'
}

interface IOrderIndex {
    id: number,
    orderIndex: number
}

class ProductService {
    async create({name, price, description, categoryId, rating, sku, orderIndex, type, size, image}: ProductType) {
        return sequelize.transaction(async (t) => {
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

            const products = await Product.findAll({
                include: [{model: ProductSize, as: 'sizes'}],
            });

            let maxValueOrder = 0;
            products.forEach((product) => {
                if (product.orderIndex > maxValueOrder) {
                    maxValueOrder = product.orderIndex
                }
            });

            const fileName = await FsService.CreateImage(image)
            const product = await Product.create({
                name,
                rating,
                description,
                image: fileName,
                orderIndex: maxValueOrder + 1,
                type,
                categoryId
            }, {transaction: t})


            const parsedSize = size ? JSON.parse(size) : null;
            const parsedPrice = JSON.parse(String(price));
            const parsedSku = sku ? JSON.parse(sku) : null;


            const sizePromises = parsedPrice.map(async (_: void, index: number) => {
                return await ProductSize.create({
                    size: parsedSize ? parsedSize[index] : null,
                    price: parsedPrice[index],
                    sku: parsedSku ? parsedSku[index] : null,
                    productId: product.id || 0
                }, {transaction: t})
            })

            const productSizes = await Promise.all(sizePromises);

            const productSizeObj = productSizes;
            const productObj = product;
            const mergedData = {
                ...productObj.dataValues,
                sizes: productSizeObj
            }

            return mergedData;
        })
    }

    async delete(id: number) {
        return sequelize.transaction(async (t) => {
            const foundProduct = await Product.findOne({
                where: {id},
                include: [{model: ProductSize, as: 'sizes'}],
            });

            if (!foundProduct) {
                throw ApiError.badRequest('Введите корректный id продукта', [
                    {
                        name: 'delete',
                        description: 'Ошибка удаления продукта'
                    }
                ])
            }

            await FsService.DeleteImage(foundProduct.image);

            await OrderProduct.update(
                {image: 'images/not-found-product.jpg'},
                {
                    where: {
                        image: foundProduct.image
                    },
                    transaction: t
                }
            )

            await ProductSize.destroy({
                where: {
                    productId: foundProduct.id
                },
                transaction: t
            })

            await Product.destroy({
                where: {id},
                transaction: t
            });

            return "Deleted successfully";
        });
    }

    async getAll({categoryId, sortBy, sortOrder}: IGetProducts) {
        let products: Product[];

        if (!!categoryId) {
            if (!sortBy || !sortOrder) {
                throw ApiError.badRequest('Не указана сортировка', [
                    {
                        name: 'getAll',
                        description: 'Ошибка получения продуктов'
                    }
                ])
            }

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

        const parsedData = products.reduce((previousValue: Product[], currentValue: any) => {
            currentValue.sizes?.sort((a: ProductSize, b: ProductSize) => a.price - b.price);
            return [...previousValue, currentValue.sizes?.map((item: ProductSize) => {
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

    async change({id, name, price, description, categoryId, rating, sku, orderIndex, type, size, image}: ProductType) {
        const result = sequelize.transaction(async (t) => {
            const allProducts = await Product.findAll({
                include: [{model: ProductSize, as: 'sizes'}]
            });
            const foundProduct = await Product.findOne({
                where: {id},
                include: [{model: ProductSize, as: 'sizes'}]
            })

            if (!foundProduct) {
                throw ApiError.badRequest('Введите корректный id продукта', [
                    {
                        name: 'change',
                        description: 'Ошибка изменения продукта'
                    }
                ])
            }

            await ProductSize.destroy({
                where: {productId: id},
                transaction: t
            })

            const parsedSize = size ? JSON.parse(size) : null;
            const parsedPrice = price ? JSON.parse(String(price)) : null;
            const parsedSku = sku ? JSON.parse(sku) : null;

            const sizePromises = parsedPrice?.map(async (_: void, index: number): Promise<ProductSize> => {
                return await ProductSize.create({
                    size: parsedSize ? parsedSize[index] : null,
                    price: parsedPrice ? parsedPrice[index] : null,
                    sku: parsedSku ? parsedSku[index] : null,
                    productId: foundProduct.id || 0
                }, {transaction: t})
            })

            let newSizes;
            if (sizePromises) {
                newSizes = await Promise.all(sizePromises);
            }

            foundProduct.name = name ?? foundProduct.name;
            foundProduct.rating = rating ?? foundProduct.rating;
            foundProduct.description = description ?? foundProduct.description;
            const newImageName = await FsService.ChangeImage(foundProduct.image, image);
            if (newImageName) foundProduct.image = newImageName;
            foundProduct.orderIndex = orderIndex ? orderIndex : (allProducts).length === 1 ? 1 : (allProducts).length + 1;
            foundProduct.type = type ?? foundProduct.type;
            foundProduct.categoryId = categoryId ?? foundProduct.categoryId;
            await foundProduct.save();

            const mergedData = {
                ...foundProduct.dataValues,
                sizes: newSizes || null
            }

            return mergedData;
        })

        return result;
    }

    async changeOrderIndex(data: IOrderIndex) {
        if (!data || !Array.isArray(data)) {
            throw ApiError.badRequest('Отправьте корректные данные', [
                {
                    name: 'changeOrderIndex',
                    description: 'Ошибка изменения индекса продуктов'
                }
            ])
        }

        const dataPromises = data.map(async (item) => {
            return await Product.update({orderIndex: item.orderIndex}, {
                where: {
                    id: item.id
                }
            })
        })

        await Promise.all(dataPromises);

        return 'Successfully changed';

    }
}

export default new ProductService();