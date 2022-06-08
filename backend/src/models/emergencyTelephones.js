const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');

const EmergencyTelephones = sequelize.define('telefonos_emergencia', {
        emergencyTelephoneId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idTelefonoEmergencia'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'nombre'
        },
        phoneNumber: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'numeroTelefono'
        },
        shortName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'nombreCorto'
        },
    }, {
        sequelize,
        tableName: 'telefonos_emergencia',
        timestamps: false,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idTelefonoEmergencia" }
                ]
            }
        ]
    }
);

module.exports = EmergencyTelephones;