const sequelize = require("../db");
const {DataTypes} = require("sequelize");
const branches = require('../data/branches')

const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING},
    dateOfBirth: {type: DataTypes.DATE},
    role: {type: DataTypes.ENUM('USER', 'ADMIN'), defaultValue: "USER"},
    name: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    tel: {type: DataTypes.STRING, allowNull: false, unique: true},
    street: {type: DataTypes.STRING},
    house: {type: DataTypes.INTEGER},
    floor: {type: DataTypes.INTEGER},
    entrance: {type: DataTypes.INTEGER},
    room: {type: DataTypes.INTEGER},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    bonus: {type: DataTypes.INTEGER, defaultValue: 0}
}, {
    timestamps: true
});

const Branch = sequelize.define('branch', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.ENUM(...Object.values(branches)), allowNull: false}
})

const Bonus = sequelize.define("bonus", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    score: {type: DataTypes.INTEGER, defaultValue: 0}
})

const Confirmation = sequelize.define("confirmation", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    requestId: {type: DataTypes.STRING, allowNull: false},
    code: {type: DataTypes.INTEGER, allowNull: false},
    expiresIn: {type: DataTypes.DATE, allowNull: false},
    used: {type: DataTypes.BOOLEAN, defaultValue: false}
}, {
    timestamps: true
})

const Token = sequelize.define("token", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING, required: true}
});

const Promocode = sequelize.define("promocode", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        code: {type: DataTypes.STRING, allowNull: false, unique: true},
        type: {type: DataTypes.ENUM('RUB', 'percent')},
        discount: {type: DataTypes.INTEGER, allowNull: false},
        limit: {
            type: DataTypes.STRING, defaultValue: 'infinite', validate: {
                isInfinityOrNumber: function (val) {
                    if (val !== 'infinite' && !Number.isInteger(Number(val))) {
                        throw new Error('Number must be "infinite" or an integer.');
                    }
                }
            }
        }
    },
    {
        timestamps: true
    }
)

const Order = sequelize.define("order", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        orderId: {type: DataTypes.INTEGER},
        totalPrice: {type: DataTypes.INTEGER, allowNull: false},
        totalAmount: {type: DataTypes.INTEGER, allowNull: false},
        type: {type: DataTypes.ENUM('delivery', 'pickup'), allowNull: false},
        name: {type: DataTypes.STRING, allowNull: false},
        address: {type: DataTypes.STRING},
        entrance: {type: DataTypes.INTEGER},
        floor: {type: DataTypes.INTEGER},
        room: {type: DataTypes.INTEGER},
        tel: {type: DataTypes.STRING, allowNull: false},
        email: {type: DataTypes.STRING},
        day: {type: DataTypes.STRING},
        time: {type: DataTypes.STRING},
        utensils: {type: DataTypes.INTEGER, defaultValue: 0},
        payment: {type: DataTypes.ENUM('cash', 'card'), allowNull: false},
        commentary: {type: DataTypes.TEXT},
        promocode: {type: DataTypes.STRING, allowNull: true},
        status: {type: DataTypes.ENUM('new', 'accepted', 'production', 'produced', 'delivery', 'completed', 'deleted'), allowNull: false, defaultValue: 'new'}
    },
    {
        timestamps: true
    });

const OrderProduct = sequelize.define("orderProduct", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    productId: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false, unique: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 1},
    description: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: false},
    orderIndex: {type: DataTypes.INTEGER, defaultValue: null},
    type: {type: DataTypes.ENUM('pizza', 'other'), defaultValue: 'other'},
    sizeId: {type: DataTypes.INTEGER, allowNull: false},
    size: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER, allowNull: false},
    sku: {type: DataTypes.STRING, defaultValue: null},
    amount: {type: DataTypes.INTEGER, allowNull: false, defaultValue : 1}
},{
    timestamps: true
})

const Product = sequelize.define("product", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 1},
    description: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: false},
    orderIndex: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM('pizza', 'other'), defaultValue: 'other'},
});

const ProductSize = sequelize.define("productSize", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    size: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER, allowNull: false},
    sku: {type: DataTypes.STRING, defaultValue: null, unique: true},
})

const Category = sequelize.define("category", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    image: {type: DataTypes.STRING},
    orderIndex: {type: DataTypes.INTEGER, allowNull: false}
});

User.hasOne(Token);
Token.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

Branch.hasMany(Order);
Order.belongsTo(Branch, {
    foreignKey: {
        name: 'branchId',
        allowNull: false
    }
});

User.hasOne(Confirmation);
Confirmation.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
})

User.hasMany(Order);
Order.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: true
    }
})

Order.hasOne(Bonus);
Bonus.belongsTo(Order, {
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
})

Order.hasMany(OrderProduct, { as: 'products' });
OrderProduct.belongsTo(Order, {
    foreignKey: {
        name: 'orderId',
        allowNull: false
    }
})

Category.hasMany(Product);
Product.belongsTo(Category, {
    foreignKey: {
        name: 'categoryId',
        allowNull: false
    }
});

Product.hasMany(ProductSize, { as: 'sizes'} );
ProductSize.belongsTo(Product, {
    foreignKey: {
        name: 'productId',
        allowNull: false
    }
});

module.exports = {
    User,
    Confirmation,
    Order,
    OrderProduct,
    Product,
    Category,
    Token,
    Promocode,
    ProductSize,
    Bonus,
    Branch
};