const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const ClaimType = sequelize.define('tipo_reclamo', {
        claimTypeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idTipoReclamo'
        },
        CTdescription: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'descripcionTR'
        }
    }, {
        sequelize,
        tableName: 'tipo_reclamo',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idTipoReclamo" }
                ]
            }
        ]
    }
);

module.exports = ClaimType;