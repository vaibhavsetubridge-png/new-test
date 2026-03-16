const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Item = sequelize.define("Item", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "", 
    },
  });

  return Item;
};
