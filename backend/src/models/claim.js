const { DataTypes } = require('sequelize');
const sequelize = require('../database/db-connection');
const MunicipalAgent = require('./municipalAgent');
const ClaimSubcategory = require('./claimSubcategory');
const InsecurityFactType = require('./insecurityFactType');
const Neighbor = require('./neighbor');

const Claim = sequelize.define('reclamo', {
        claimId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            field: 'idReclamo'
        },
        dateTimeCreation: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'fechaHoraCreacion'
        },
        dateTimeObservation: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'fechaHoraObservacion'
        },
        dateTimeEnd: {
            type: DataTypes.DATE,
            field: 'fechaHoraFin'
        },
        street: {
            type: DataTypes.STRING(45),
            field: 'calle'
        },
        streetNumber: {
            type: DataTypes.STRING(45),
            field: 'numeroCalle'
        },
        latitude: {
            type: DataTypes.STRING(45),
            field: 'latitud'
        },
        longitude: {
            type: DataTypes.STRING(45),
            field: 'longitud'
        },
        mapAddress: {
            type: DataTypes.STRING(500),
            field: 'direccionMapa'
        },
        comment: {
            type: DataTypes.STRING(500),
            field: 'comentario'
        },
        resolutionQualification: {
            type: DataTypes.INTEGER,
            field: 'calificacionResolucion'
        },
        photo: {
            type: DataTypes.BLOB,
            field: 'foto'
        },
        municipalAgentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'idAgenteMunicipal',
            references: {
                model: MunicipalAgent,
                key: 'idAgenteMunicipal'
            }
        },
        claimSubcategoryId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'idSubcategoriaReclamo',
            references: {
                model: ClaimSubcategory,
                key: 'idSubcategoriaReclamo'
            }
        },
        insecurityFactTypeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: 'idTipoHechoDeInseguridad',
            references: {
                model: InsecurityFactType,
                key: 'idTipoHechoDeInseguridad'
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
        },
    }, {
        sequelize,
        tableName: 'reclamo',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "idReclamo" }
                ]
            },
            {
                name: "fk_Reclamo_AgenteMunicipal_idx",
                using: "BTREE",
                fields: [
                    { name: "idAgenteMunicipal" }
                ]
            },
            {
                name: "fk_Reclamo_SubcategoriaReclamo_idx",
                using: "BTREE",
                fields: [
                    { name: "idSubcategoriaReclamo" }
                ]
            },
            {
                name: "fk_Reclamo_TipoHechoDeInseguridad_idx",
                using: "BTREE",
                fields: [
                    { name: "idTipoHechoDeInseguridad" }
                ]
            },
            {
                name: "fk_Reclamo_Vecino_idx",
                using: "BTREE",
                fields: [
                    { name: "idVecino" }
                ]
            }
        ]
    }
);

module.exports = Claim;