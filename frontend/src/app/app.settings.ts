export class Settings {
  // Global Settings
  public static APP_NAME = 'SecurityReports';
  public static APP_VERSION = '0.0.1';


  // (+) EndPoints

  public static endPoints = {
    claim: 'claim',
    claimTypes: 'claimTypes',
    contacts: 'contacts',
    files: 'files',
    emergencyTelephones: 'emergencyTelephones',
    insecurityFact: 'insecurityFact',
    insecurityFactTypes: 'insecurityFactTypes',
    map: 'map',
    status: 'status',
    user: 'user'
  };

  public static endPointsMethods = {
    claim: {
      claimById: '/claimById',
      claimsForMap: '/claimsForMap',
      claimTracking: '/claimTracking',
      favorites: '/favorites',
      pending: '/pending',
      takenClaims: '/takenClaims',
      updateStatus: '/updateStatus'
    },
    insecurityFact: {
      favorites: '/favorites',
      insecurityFactsForMapForMunicipalAgent: '/insecurityFactsForMapForMunicipalAgent',
      insecurityFactsForMapForNeighbor: '/insecurityFactsForMapForNeighbor',
    },
    map: {
      getAddress: '/getAddress'
    },
    user: {
      changePassword: '/changePassword',
      login: '/login',
      signup: '/signup',
      editProfileData: '/editProfileData',
      loginWithSocialMedia: '/loginWithSocialMedia',
    }
  };

  // (-) EndPoints

  public static storage = {
    addressInfo: 'securityReports.addressInfo',
    contacts: 'securityReports.contacts',
    role: 'securityReports.role',
    token: 'securityReports.token',
    user: 'securityReports.user'
  };

  public static roles = {
    user: 'user'
  };

  public static coordinates = {
    rosario: [-32.94728264360368, -60.64127184874043]
  }

}
