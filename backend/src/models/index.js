const Claim = require('./claim');
const ClaimSubcategory = require('./claimSubcategory');
const ClaimType = require('./claimType');
const Contact = require('./contact');
const Favorites = require('./favorites');
const InsecurityFactType = require('./insecurityFactType');
const MunicipalAgent = require('./municipalAgent');
const Neighbor = require('./neighbor');
const StatusClaim = require('./status_claim');
const Status = require('./status');


// Associations
const initAssociations = () => {
        // tipo_reclamo & subcategoria_reclamo
    ClaimType.hasMany(ClaimSubcategory, { foreignKey: 'idTipoReclamo' });
    ClaimSubcategory.belongsTo(ClaimType, { foreignKey: 'idTipoReclamo' });

        // vecino & contacto
    Neighbor.hasMany(Contact, { foreignKey: 'idVecino' });
    Contact.belongsTo(Neighbor, { foreignKey: 'idVecino' });

        // agente_municipal & reclamo
    MunicipalAgent.hasMany(Claim, { foreignKey: 'idAgenteMunicipal', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(MunicipalAgent, { foreignKey: 'idAgenteMunicipal' });

        // subcategoria_reclamo & reclamo
    ClaimSubcategory.hasMany(Claim, { foreignKey: 'idSubcategoriaReclamo', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(ClaimSubcategory, { foreignKey: 'idSubcategoriaReclamo' });

        // tipo_hecho_de_inseguridad & reclamo
    InsecurityFactType.hasMany(Claim, { foreignKey: 'idTipoHechoDeInseguridad', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(InsecurityFactType, { foreignKey: 'idTipoHechoDeInseguridad' });

        // vecino & reclamo
    Neighbor.hasMany(Claim, { foreignKey: 'idVecino', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(Neighbor, { foreignKey: 'idVecino' });

        // reclamo & estado a través de la tabla estado_reclamo
    Claim.belongsToMany(Status, { through: StatusClaim, foreignKey: 'idReclamo', otherKey: 'idEstado' });
    Status.belongsToMany(Claim, { through: StatusClaim, foreignKey: 'idEstado', otherKey: 'idReclamo' });

        // reclamo & vecino a través de la tabla favoritos
    Claim.belongsToMany(Neighbor, { through: Favorites, foreignKey: 'idReclamo', otherKey: 'idVecino' });
    Neighbor.belongsToMany(Claim, { through: Favorites, foreignKey: 'idVecino', otherKey: 'idReclamo' });
};

initAssociations(); // TODO: Revisar que este método funcione bien cuando hagamos un insert o algún otro tipo de operación sobre la base de datos.


module.exports = {
    Claim,
    ClaimSubcategory,
    ClaimType,
    Contact,
    Favorites,
    InsecurityFactType,
    MunicipalAgent,
    Neighbor,
    StatusClaim,
    Status
};