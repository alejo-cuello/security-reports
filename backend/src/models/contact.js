const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const Neighbor = require('./neighbor');

const Contact = sequelize.define('contacto', {
        contactId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idContacto'
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'nombre'
        },
        phoneNumber: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'numeroTelefono'
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
        tableName: 'contacto',
        timestamps: false,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idContacto" }
                ]
            },
            {
                name: 'fk_Contacto_Vecino_idx',
                using: "BTREE",
                fields: [
                    { name: "idVecino" }
                ]
            }
        ]
    }
);

module.exports = Contact;