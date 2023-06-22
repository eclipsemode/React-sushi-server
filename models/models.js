const sequelize = require("../db");
const {DataTypes} = require("sequelize");

const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false, validate: {notEmpty: true, isEmail: true}},
    dateOfBirth: {type: DataTypes.DATE},
    password: {type: DataTypes.STRING, allowNull: false},
    role: {type: DataTypes.ENUM('USER', 'ADMIN'), defaultValue: "USER"},
    name: {type: DataTypes.STRING, allowNull: false, validate: {notEmpty: true}},
    surname: {type: DataTypes.STRING},
    tel: {type: DataTypes.STRING, allowNull: false, unique: true},
    street: {type: DataTypes.STRING},
    house: {type: DataTypes.NUMBER},
    floor: {type: DataTypes.NUMBER},
    entrance: {type: DataTypes.NUMBER},
    room: {type: DataTypes.NUMBER},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    activationLink: {type: DataTypes.STRING}
}, {
    timestamps: true
});

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
        orderProducts: {type: DataTypes.ARRAY(DataTypes.JSONB), allowNull: false},
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
        status: {type: DataTypes.ENUM('new', 'production', 'produced', 'delivery', 'completed', 'deleted'), allowNull: false, defaultValue: 'new'}
    },
    {
        timestamps: true
    });

const Product = sequelize.define("product", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    price: {type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 1},
    description: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: false},
    sku: {type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: null},
    orderIndex: {type: DataTypes.INTEGER, defaultValue: null},
    type: {type: DataTypes.ENUM('pizza', 'other'), defaultValue: 'other'}
});

const Category = sequelize.define("category", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false}
});

User.hasOne(Token);
Token.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

User.hasMany(Order);
Order.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: true
    }
})

Category.hasMany(Product);
Product.belongsTo(Category, {
    foreignKey: {
        name: 'categoryId',
        allowNull: false
    }
});

module.exports = {
    User,
    Order,
    Product,
    Category,
    Token,
    Promocode
};