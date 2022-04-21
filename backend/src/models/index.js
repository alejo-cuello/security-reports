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
const EmergencyTelephones = require('./emergencyTelephones');


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
    Neighbor.hasMany(Claim, { foreignKey: 'neighborId', as: 'claims', onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    Claim.belongsTo(Neighbor, { foreignKey: 'neighborId', as: 'neighbor' });


        // reclamo & estado a través de la tabla estado_reclamo        
            // reclamo & estado_reclamo
    Claim.hasMany(StatusClaim, { foreignKey: 'claimId', as: 'status_claim' });
    StatusClaim.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });
            
            // estado & estado_reclamo
    Status.hasMany(StatusClaim, { foreignKey: 'statusId', as: 'status_claim' });
    StatusClaim.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });

        // reclamo & vecino a través de la tabla favoritos
            // reclamo & favoritos
    Claim.hasMany(Favorites, { foreignKey: 'claimId', as: 'favorites' });
    Favorites.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });

            // vecino & favoritos
    Neighbor.hasMany(Favorites, { foreignKey: 'neighborId', as: 'favorites' });
    Favorites.belongsTo(Neighbor, { foreignKey: 'neighborId', as: 'neighbor' });
    
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
    Status,
    EmergencyTelephones
};