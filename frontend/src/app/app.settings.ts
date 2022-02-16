export class Settings {
  // Global Settings
  public static APP_NAME = 'SecurityReports';
  public static APP_VERSION = '0.0.1';


  // (+) EndPoints

  public static endPoints = {
    map: 'map',
    user: 'user'
  };

  public static endPointsMethods = {
    map: {
      getAddress: '/getAddress'
    },
    user: {
      login: '/login',
      signup: '/signup'
    }
  };

  // (-) EndPoints

  // (+) Keys

  public static keys = {
    googleMaps: ''
  }

  // (-) Keys

  public static storage = {
    addressId: 'securityReports.addressId',
    address: 'securityReports.address',
    addressGoogle: 'securityReports.addressGoogle',
    addressLongitude: 'securityReports.addressLongitude',
    addressLatitude: 'securityReports.addressLatitude',
    saveAddress: 'securityReports.saveAddress',
    street: 'securityReports.street',
    streetNumber: 'securityReports.streetNumber',
    user: 'securityReports.user',
  };

  public static roles = {
    user: 'user'
  };

  public static coordinates = {
    rosario: [-32.94728264360368, -60.64127184874043]
  }

}
