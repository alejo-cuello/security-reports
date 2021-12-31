const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const ClaimType = require('./claimType');

const ClaimSubcategory = sequelize.define('subcategoria_reclamo', {
        claimSubcategoryId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idSubcategoriaReclamo' 
        },
        CSCdescription: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'descripcionSCR'
        },
        claimTypeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'idTipoReclamo',
            references: {
                model: ClaimType,
                key: 'idTipoReclamo'
            }
        }
    }, {
        sequelize,
        tableName: 'subcategoria_reclamo',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idSubcategoriaReclamo" }
                ]
            },
            {
                name: "fk_SubcategoriaReclamo_TipoReclamo_idx",
                using: "BTREE",
                fields: [
                    { name: "idTipoReclamo" }
                ]
            }
        ]
    }
);

module.exports = ClaimSubcategory;