const { sequelize } = require("../config/connectDb");
const { DataTypes } = require("sequelize");

const book = sequelize.define("book_", {
  title : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  author : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  price : {
    type : DataTypes.INTEGER,
    allowNull : false,
  },
  cover : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  totalsold : {
    type : DataTypes.INTEGER,
    allowNull : false,
  },
  totalavailable : {
    type : DataTypes.INTEGER,
    allowNull : false,
  },
  genre : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  created_at : {
    type : DataTypes.DATE,
    defaultValue : sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updated_at : {
    type : DataTypes.DATE,
    defaultValue : sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, {
  tableName : 'book_book',
  freezeTableName : true,
  timestamps : false
});

const seller = sequelize.define("account_seller", {
  user_id : {
    type : DataTypes.INTEGER,
    allowNull : false,
  },
  storename : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  totalproductsold : {
    type : DataTypes.INTEGER,
    allowNull : false,
  },
}, {
  tableName : 'account_seller',
  freezeTableName : true,
  timestamps : false
})

seller.hasMany(book, {
  foreignKey : "seller_id",
  onDelete : "CASCADE",
  onUpdate : "CASCADE",
});

book.belongsTo(seller, {
  as : "seller",
  foreignKey : "seller_id",
  onDelete : "CASCADE",
  onUpdate : "CASCADE",
});

sequelize.sync( { force : false } );

module.exports = {
    book,
    seller
}