import sequelize from '../db.js'
import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import {OrderStatusType, OrderType, PaymentType, ProductType, PromocodeType, UserType} from "./types.js";


class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id?: CreationOptional<number>;
    declare email?: string;
    declare dateOfBirth?: Date;
    declare role?: UserType;
    declare name?: string;
    declare surname?: string;
    declare tel: string;
    declare street?: string;
    declare house?: number;
    declare floor?: number;
    declare entrance?: number;
    declare room?: number;
    declare isActivated?: boolean ;
    declare bonus?: number;
}

User.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING},
    dateOfBirth: {type: DataTypes.DATE},
    role: {type: DataTypes.ENUM, values: ['USER', 'ADMIN'], defaultValue: "USER"},
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
    timestamps: true,
    sequelize,
    tableName: 'users'
})


class Branch extends Model<InferAttributes<Branch>, InferCreationAttributes<Branch>> {
    declare id?: CreationOptional<number>;
    declare name: string;
}

Branch.init({
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, allowNull: false}
    },
    {
        sequelize,
        tableName: 'branches'
    })

class Bonus extends Model<InferAttributes<Bonus>, InferCreationAttributes<Bonus>> {
    declare id?: CreationOptional<number>;
    declare score: number;
    declare orderId?: number;
}

Bonus.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    score: {type: DataTypes.INTEGER, defaultValue: 0},
    // orderId: {type: DataTypes.INTEGER, references: { model: 'orders', key: 'id' }}
}, {
    sequelize,
    tableName: 'bonuses'
})

class Confirmation extends Model<InferAttributes<Confirmation>, InferCreationAttributes<Confirmation>> {
    declare id?: CreationOptional<number>;
    declare requestId: string;
    declare code: number;
    declare expiresIn: Date;
    declare used?: boolean;
    declare userId?: number;
}

Confirmation.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    requestId: {type: DataTypes.STRING, allowNull: false},
    code: {type: DataTypes.INTEGER, allowNull: false},
    expiresIn: {type: DataTypes.DATE, allowNull: false},
    used: {type: DataTypes.BOOLEAN, defaultValue: false},
    // userId: {type: DataTypes.INTEGER, references: {model: 'users', key: 'id'}}
}, {
    timestamps: true,
    sequelize,
    tableName: 'confirmations'
})

class Token extends Model<InferAttributes<Token>, InferCreationAttributes<Token>> {
    declare id?: CreationOptional<number>;
    declare refreshToken: string;
    declare userId?: number;
}

Token.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING},
    // userId: {type: DataTypes.INTEGER, references: {model: 'users', key: 'id'}}
}, {
    sequelize,
    tableName: 'tokens'
})

class Promocode extends Model<InferAttributes<Promocode>, InferCreationAttributes<Promocode>> {
    declare id?: CreationOptional<number>;
    declare code: string;
    declare type: PromocodeType;
    declare discount: number;
    declare limit: 'infinite' | number
}

Promocode.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    code: {type: DataTypes.STRING, allowNull: false, unique: true},
    type: {type: DataTypes.ENUM, values: ['RUB', 'percent']},
    discount: {type: DataTypes.INTEGER, allowNull: false},
    limit: {
        type: DataTypes.STRING, defaultValue: 'infinite', validate: {
            isInfinityOrNumber: function (val: string | number) {
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
})

class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
    declare id?: CreationOptional<number>;
    declare orderId: number;
    declare totalPrice: number;
    declare totalAmount: number;
    declare type: OrderType;
    declare name: string;
    declare address: string;
    declare entrance: number;
    declare floor: number;
    declare room: number;
    declare tel: string;
    declare email: string;
    declare day: string;
    declare time: string;
    declare utensils: number;
    declare payment: PaymentType;
    declare commentary: string;
    declare promocode: string;
    declare status: OrderStatusType;
    declare channel?: number;
    declare userId?: number;
    declare branchId?: number;
}

Order.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    orderId: {type: DataTypes.INTEGER},
    totalPrice: {type: DataTypes.INTEGER, allowNull: false},
    totalAmount: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM, values: ['delivery', 'pickup'], allowNull: false},
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
    payment: {type: DataTypes.ENUM, values: ['cash', 'card'], allowNull: false},
    commentary: {type: DataTypes.TEXT},
    promocode: {type: DataTypes.STRING, allowNull: true},
    status: {
        type: DataTypes.ENUM,
        values: ['new', 'accepted', 'production', 'produced', 'delivery', 'completed', 'deleted'],
        allowNull: false,
        defaultValue: 'new'
    },
    channel: {type: DataTypes.INTEGER, defaultValue: 2030},
    // userId: {type: DataTypes.INTEGER, references: {model: 'users', key: 'id'}},
    // branchId: {type: DataTypes.INTEGER, references: {model: 'branches', key: 'id'}},
}, {
    timestamps: true,
    sequelize,
    tableName: 'orders'
})

class OrderProduct extends Model<InferAttributes<OrderProduct>, InferCreationAttributes<OrderProduct>> {
    declare id?: CreationOptional<number>;
    declare productId: number;
    declare name: string;
    declare rating: number;
    declare description: string;
    declare image: string;
    declare orderIndex: number;
    declare type: ProductType;
    declare sizeId: number;
    declare size: string;
    declare price: number;
    declare sku: string;
    declare amount: number;
    declare orderId?: number;
}

OrderProduct.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    productId: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false, unique: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 1},
    description: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: false},
    orderIndex: {type: DataTypes.INTEGER, defaultValue: null},
    type: {type: DataTypes.ENUM, values: ['pizza', 'other'], defaultValue: 'other'},
    sizeId: {type: DataTypes.INTEGER, allowNull: false},
    size: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER, allowNull: false},
    sku: {type: DataTypes.STRING, defaultValue: null},
    amount: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    // orderId: {type: DataTypes.INTEGER, references: {model: 'orders', key: 'id'}}
}, {
    timestamps: true,
    sequelize,
    tableName: 'orderProducts'
})

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id?: CreationOptional<number>;
    declare name: string;
    declare rating: number;
    declare description: string;
    declare image: string;
    declare orderIndex: number;
    declare type: ProductType;
    declare categoryId?: number;
    declare sizes?: ProductSize[];
}

Product.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: false},
    rating: {type: DataTypes.INTEGER, defaultValue: 1},
    description: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: false},
    orderIndex: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM, values: ['pizza', 'other'], defaultValue: 'other'},
    // categoryId: {type: DataTypes.INTEGER, references: {model: 'categories', key: 'id'}}
}, {
    sequelize,
    tableName: 'products'
})

class ProductSize extends Model<InferAttributes<ProductSize>, InferCreationAttributes<ProductSize>> {
    declare id?: CreationOptional<number>;
    declare size: string;
    declare price: number;
    declare sku: string;
    declare productId?: number;
}

ProductSize.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    size: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER, allowNull: false},
    sku: {type: DataTypes.STRING, defaultValue: null, unique: true},
    // productId: {type: DataTypes.INTEGER, references: {model: 'products', key: 'id'}}
}, {
    sequelize,
    tableName: 'productSizes'
})

class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
    declare id?: CreationOptional<number>;
    declare name: string;
    declare image: string;
    declare orderIndex: number;
}

Category.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    image: {type: DataTypes.STRING},
    orderIndex: {type: DataTypes.INTEGER, allowNull: false}
}, {
    sequelize,
    tableName: 'categories'
})

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
})

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
})

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

export {
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