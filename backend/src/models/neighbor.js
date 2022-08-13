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
            unique: true,
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING(45),
            field: 'telefono'
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'contraseña'
        },
        facebookId: {
            type: DataTypes.STRING(45),
            allowNull: true,
            field: 'idFacebook'
        },
        emailIsVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'emailVerificado'
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
            },
            {
                name: "email_UNIQUE",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "email" }
                ]
            }
        ]
    }
);

module.exports = Neighbor;