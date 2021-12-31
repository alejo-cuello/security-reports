const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const InsecurityFactType = sequelize.define('tipo_hecho_de_inseguridad', {
        insecurityFactTypeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idTipoHechoDeInseguridad'
        },
        IFTdescription: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'descripcionTHI'
        }
    }, {
        sequelize,
        tableName: 'tipo_hecho_de_inseguridad',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idTipoHechoDeInseguridad" }
                ]
            }
        ]
    }
);

module.exports = InsecurityFactType;