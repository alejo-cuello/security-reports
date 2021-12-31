const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const Neighbor = require('./neighbor');
const Claim = require('./claim');

const Favorites = sequelize.define('favoritos', {
        favoritesId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idFavoritos'
        },
        claimId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'idReclamo',
            references: {
                model: Claim,
                key: 'idReclamo'
            }
        },
        neighborId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'idVecino',
            references: {
                model: Neighbor,
                key: 'idVecino'
            }
        }
    }, {
        sequelize,
        tableName: 'favoritos',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idFavoritos" }
                ]
            },
            {
                name: "fk_Favoritos_Vecino_idx",
                using: "BTREE",
                fields: [
                    { name: "idVecino" }
                ]
            },
            {
                name: "fk_Favoritos_Reclamo_idx",
                using: "BTREE",
                fields: [
                    { name: "idReclamo" }
                ]
            }
        ]
    }
);

module.exports = Favorites;