const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const Status = sequelize.define('estado', {
        statusId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idEstado'
        },
        STAdescription: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'descripcionEST'
        }
    }, {
        sequelize,
        tableName: 'estado',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idEstado" }
                ]
            }
        ]
    }
);

module.exports = Status;