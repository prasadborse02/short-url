const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Click = sequelize.define('Click', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    short_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    clicked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ubid: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    timestamps: false,
});

module.exports = Click;
