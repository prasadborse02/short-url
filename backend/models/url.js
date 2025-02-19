const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const URL = sequelize.define('url', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    original_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    short_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

module.exports = URL;
