export class Settings {
  // Global Settings
  public static APP_NAME = 'SecurityReports';
  public static APP_VERSION = '0.0.1';


  // (+) EndPoints

  public static endPoints = {
    claim: 'claim',
    claimTypes: 'claimTypes',
    contacts: 'contacts',
    insecurityFact: 'insecurityFact',
    insecurityFactTypes: 'insecurityFactTypes',
    map: 'map',
    status: 'status',
    user: 'user'
  };

  public static endPointsMethods = {
    claim: {
      favorites: '/favorites',
      pending: '/pending',
      takenClaims: '/takenClaims',
      updateStatus: '/updateStatus'
    },
    insecurityFact: {
      favorites: '/favorites',
    },
    map: {
      getAddress: '/getAddress'
    },
    user: {
      login: '/login',
      signup: '/signup'
    }
  };

  // (-) EndPoints

  public static storage = {
    contacts: 'securityReports.contacts',
    coordinates: 'securityReports.coordinates',
    role: 'securityReports.role',
    street: 'securityReports.street',
    streetNumber: 'securityReports.streetNumber',
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
