import sequelize from '../db.js';
import { DataTypes, Model } from "sequelize";
class User extends Model {
}
User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING },
    dateOfBirth: { type: DataTypes.DATE },
    role: { type: DataTypes.ENUM, values: ['USER', 'ADMIN'], defaultValue: "USER" },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    tel: { type: DataTypes.STRING, allowNull: false, unique: true },
    street: { type: DataTypes.STRING },
    house: { type: DataTypes.INTEGER },
    floor: { type: DataTypes.INTEGER },
    entrance: { type: DataTypes.INTEGER },
    room: { type: DataTypes.INTEGER },
    isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
    bonus: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    timestamps: true,
    sequelize,
    tableName: 'users'
});
class Branch extends Model {
}
Branch.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, {
    sequelize,
    tableName: 'branches'
});
class Bonus extends Model {
}
Bonus.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    sequelize,
    tableName: 'bonuses'
});
class Confirmation extends Model {
}
Confirmation.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requestId: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.INTEGER, allowNull: false },
    expiresIn: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    timestamps: true,
    sequelize,
    tableName: 'confirmations'
});
class Token extends Model {
}
Token.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING },
}, {
    sequelize,
    tableName: 'tokens'
});
class Promocode extends Model {
}
Promocode.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.ENUM, values: ['RUB', 'percent'] },
    discount: { type: DataTypes.INTEGER, allowNull: false },
    limit: {
        type: DataTypes.STRING, defaultValue: 'infinite', validate: {
            isInfinityOrNumber: function (val) {
                if (val !== 'infinite' && !Number.isInteger(Number(val))) {
                    throw new Error('Number must be "infinite" or an integer.');
                }
            }
        }
    }
}, {
    timestamps: true,
    sequelize,
    tableName: 'promocodes'
});
class Order extends Model {
}
Order.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    totalPrice: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM, values: ['delivery', 'pickup'], allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    entrance: { type: DataTypes.INTEGER },
    floor: { type: DataTypes.INTEGER },
    room: { type: DataTypes.INTEGER },
    tel: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    day: { type: DataTypes.STRING },
    time: { type: DataTypes.STRING },
    utensils: { type: DataTypes.INTEGER, defaultValue: 0 },
    payment: { type: DataTypes.ENUM, values: ['cash', 'card'], allowNull: false },
    commentary: { type: DataTypes.TEXT },
    promocode: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM,
        values: ['new', 'accepted', 'production', 'produced', 'delivery', 'completed', 'deleted'],
        allowNull: false,
        defaultValue: 'new'
    },
    channel: { type: DataTypes.INTEGER, defaultValue: 2030 },
}, {
    timestamps: true,
    sequelize,
    tableName: 'orders'
});
class OrderProduct extends Model {
}
OrderProduct.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, unique: false },
    rating: { type: DataTypes.INTEGER, defaultValue: 1 },
    description: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    orderIndex: { type: DataTypes.INTEGER, defaultValue: null },
    type: { type: DataTypes.ENUM, values: ['pizza', 'other'], defaultValue: 'other' },
    sizeId: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, allowNull: false },
    sku: { type: DataTypes.STRING, defaultValue: null },
    amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
    timestamps: true,
    sequelize,
    tableName: 'orderProducts'
});
class Product extends Model {
}
Product.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: false },
    rating: { type: DataTypes.INTEGER, defaultValue: 1 },
    description: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM, values: ['pizza', 'other'], defaultValue: 'other' },
}, {
    sequelize,
    tableName: 'products'
});
class ProductSize extends Model {
}
ProductSize.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    size: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, allowNull: false },
    sku: { type: DataTypes.STRING, defaultValue: null, unique: true },
}, {
    sequelize,
    tableName: 'productSizes'
});
class Category extends Model {
}
Category.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    image: { type: DataTypes.STRING },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false }
}, {
    sequelize,
    tableName: 'categories'
});
User.hasOne(Token, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
Token.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
Branch.hasMany(Order, {
    foreignKey: {
        name: 'branchId',
        allowNull: false
    }
});
Order.belongsTo(Branch, {
    foreignKey: {
        name: 'branchId',
        allowNull: false
    }
});
User.hasOne(Confirmation, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
Confirmation.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
User.hasMany(Order, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
Order.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});
Order.hasOne(Bonus, {
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
});
Bonus.belongsTo(Order, {
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
});
Order.hasMany(OrderProduct, {
    as: 'products',
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
});
OrderProduct.belongsTo(Order, {
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
});
Category.hasMany(Product, {
    foreignKey: {
        name: 'categoryId',
        allowNull: false
    }
});
Product.belongsTo(Category, {
    foreignKey: {
        name: 'categoryId',
        allowNull: false
    }
});
Product.hasMany(ProductSize, {
    as: 'sizes',
    foreignKey: {
        name: 'productId',
        allowNull: false
    }
});
ProductSize.belongsTo(Product, {
    foreignKey: {
        name: 'productId',
        allowNull: false
    }
});
export { User, Confirmation, Order, OrderProduct, Product, Category, Token, Promocode, ProductSize, Bonus, Branch };
//# sourceMappingURL=models.js.map