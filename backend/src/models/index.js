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
    ClaimType.hasMany(ClaimSubcategory, { foreignKey: 'claimTypeId', as: 'claimSubcategory' });
    ClaimSubcategory.belongsTo(ClaimType, { foreignKey: 'claimTypeId', as: 'claimType' });

        // vecino & contacto
    Neighbor.hasMany(Contact, { foreignKey: 'neighborId', as: 'contacts' });
    Contact.belongsTo(Neighbor, { foreignKey: 'neighborId', as: 'neighbor' });

        // agente_municipal & reclamo
    MunicipalAgent.hasMany(Claim, { foreignKey: 'municipalAgentId', as: 'claim', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(MunicipalAgent, { foreignKey: 'municipalAgentId', as: 'municipalAgent' });

        // subcategoria_reclamo & reclamo
    ClaimSubcategory.hasMany(Claim, { foreignKey: 'claimSubcategoryId', as: 'claim',onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(ClaimSubcategory, { foreignKey: 'claimSubcategoryId', as: 'claimSubcategory' });

        // tipo_hecho_de_inseguridad & reclamo
    InsecurityFactType.hasMany(Claim, { foreignKey: 'insecurityFactTypeId', as: 'claim', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(InsecurityFactType, { foreignKey: 'insecurityFactTypeId', as: 'insecurityFactType' });

        // vecino & reclamo
    Neighbor.hasMany(Claim, { foreignKey: 'neighborId', as: 'claim', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(Neighbor, { foreignKey: 'neighborId', as: 'neighbor' });

        // reclamo & estado a través de la tabla estado_reclamo
    Claim.belongsToMany(Status, { through: StatusClaim, foreignKey: 'claimId', otherKey: 'statusId', as: 'status_claim' }); // TODO: Revisar que el 'as' esté correcto
    Status.belongsToMany(Claim, { through: StatusClaim, foreignKey: 'statusId', otherKey: 'claimId', as: 'status_claim' }); // TODO: Revisar que el 'as' esté correcto

        // reclamo & vecino a través de la tabla favoritos
    Claim.belongsToMany(Neighbor, { through: Favorites, foreignKey: 'claimId', otherKey: 'neighborId', as: 'favorites' }); // TODO: Revisar que el 'as' esté correcto
    Neighbor.belongsToMany(Claim, { through: Favorites, foreignKey: 'neighborId', otherKey: 'claimId', as: 'favorites' }); // TODO: Revisar que el 'as' esté correcto
};

initAssociations();


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