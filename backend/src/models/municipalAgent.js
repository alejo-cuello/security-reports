const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const MunicipalAgent = sequelize.define('agente_municipal', {
        municipalAgentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idAgenteMunicipal'
        },
        registrationNumber: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true,
            field: 'legajo'
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
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'contraseña'
        },
        emailIsVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'emailVerificado'
        }
    }, {
        sequelize,
        tableName: 'agente_municipal',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idAgente" }
                ]
            },
            {
                name: "Legajo_UNIQUE",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "legajo" }
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

module.exports = MunicipalAgent;