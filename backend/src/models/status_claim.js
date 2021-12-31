const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const Status = require('./status');
const Claim = require('./claim');

const StatusClaim = sequelize.define('estado_reclamo', {
        statusClaimId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idEstadoReclamo'
        },
        dateTimeStatusStart: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fechaHoraInicioEstado'
        },
        statusId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'idEstado',
            references: {
                model: Status,
                key: 'idEstado'
            }
        },
        claimId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'idReclamo',
            references: {
                model: Claim,
                key: 'idReclamo'
            }
        }
    }, {
        sequelize,
        tableName: 'estado_reclamo',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idEstadoReclamo" }
                ]
            },
            {
                name: "fk_EstadoReclamo_Estado_idx",
                using: "BTREE",
                fields: [
                    { name: "idEstado" }
                ]
            },
            {
                name: "fk_EstadoReclamo_Reclamo_idx",
                using: "BTREE",
                fields: [
                    { name: "idReclamo" }
                ]
            }
        ]
    }
);

module.exports = StatusClaim;