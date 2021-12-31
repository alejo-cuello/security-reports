const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const Neighbor = sequelize.define('vecino', {
        neighborId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idVecino'
        },
        dni: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'dni'
        },
        tramiteNumberDNI: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'nroTramiteDNI'
        },
        firstName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'nombre'
        },
        lastName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'apellido'
        },
        street: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'calle'
        },
        streetNumber: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'numeroCalle'
        },
        floor: {
            type: DataTypes.STRING(45),
            field: 'piso'
        },
        apartment: {
            type: DataTypes.STRING(45),
            field: 'departamento'
        },
        city: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'ciudad'
        },
        province: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'provincia'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'email',
        },
        phoneNumber: {
            type: DataTypes.STRING(45),
            field: 'telefono'
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'contraseña'
        }
    }, {
        sequelize,
        tableName: 'vecino',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idVecino" }
                ]
            }
        ]
    }
);

module.exports = Neighbor;