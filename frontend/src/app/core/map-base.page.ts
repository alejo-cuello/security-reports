import { Directive, NgZone, ViewChild, ElementRef } from '@angular/core';
import { PageService } from './page.service';
import { BasePage } from './base.page';

declare var google;

@Directive({selector: '[mapPage]'})
export abstract class MapBasePage extends BasePage {

  @ViewChild('map') mapElement: ElementRef;

  map: any;
  marker: any;
  geocoder: any;
  addressUser: any;
  showCurrentPosition = false;
  address: any;
  addressGoogle: any;
  latitude: any;
  latitudeLast: any;
  longitude: any;
  longitudeLast: any;
  edit = false;
  isMapInitialized = false;

  constructor(
    public pageService: PageService,
    public zone: NgZone,
  ) {
    super(pageService);
  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {

    this.pageService.showLoading();

    // Load google library
    this.pageService.loadGoogleMapsLibrary().then((google: any) => {

      // Google library loaded
      this.googleMapsLibraryLoaded();

      // Define geocoder
      this.geocoder = new google.maps.Geocoder();

      // Initialize map
      this.waitMapElementLoaded()
        .then(() => {
          this.initializeMap();
        });
    })
    .catch( err => {
      console.log(err);
      this.pageService.hideLoading();
    });
  }

  googleMapsLibraryLoaded(){
  }

  waitMapElementLoaded(){
    return new Promise( (resolve, reject) => {
      const intId = setInterval(() => {
        if(this.mapElement) {
          clearInterval(intId);
          resolve('');
        }
      }, 500);
    });
  }

  initializedMap() {
  }

  initializeMapPre() {
  }

  loadInitialVlues() {

    if(this.settings.storage.address) {
      const address = this.global.load(this.settings.storage.address);
      if (address) this.address = address;
    } else {
      console.error("No definicion para la clave 'address' del storage");
      return;
    }


    if(this.settings.storage.addressGoogle) {
      const addressGoogle = this.global.load(this.settings.storage.addressGoogle);
      if (addressGoogle) this.addressGoogle = addressGoogle;
    } else {
      console.error("No definicion para la clave 'addressGoogle' del storage");
      return;
    }

    if(this.settings.storage.addressLatitude) {
      const latitude = this.global.load(this.settings.storage.addressLatitude);
      if (latitude) this.latitude = latitude;
    } else {
      console.error("No definicion para la clave 'addressLatitude' del storage");
      return;
    }

    if (this.settings.storage.addressLongitude) {
      const longitude = this.global.load(this.settings.storage.addressLongitude);
      if(longitude) this.longitude = longitude;
    } else {
      console.error("No definicion para la clave 'addressLongitude' del storage");
      return;
    }

    this.loadExtraInitialValues();

  }

  loadExtraInitialValues() {

  }

  initializeMap() {
    this.initializeMapPre();

    this.loadInitialVlues();

    this.zone.run(() => {

      if(!this.latitude || !this.longitude) {
        this.showCurrentPosition = true;
      }
      try{
        console.log("---------initializeMap");
        var mapEle = this.mapElement.nativeElement;
        this.map = new google.maps.Map(mapEle, this.getMapOptions());

        if(this.showCurrentPosition) {
          this.setCurrentPosition();
        } else {
          if(this.latitude && this.longitude) {
            const position = {
              lat: this.latitude,
              lng: this.longitude
            };
            this.setPosition(position);
          }
        }
        this.isMapInitialized = true;
        this.initializedMap();
      } catch(error) {
        console.log(error);
        this.pageService.hideLoading();
      }
    });
  }

  setCurrentPosition() {
    this.pageService.getCurrentLocation()
      .then((position) => {
        this.setPosition(position);
        this.findAddress(position);
      })
      .catch((error) => {
        console.log("error-------:",error);
      });
  }

  setPosition(position) {
    console.log("set position...",position);
    if(!position) return;
    if(!this.map) return;

    console.log("set position...ok");
    console.log("set position...marker:", this.marker);

    // Put marker
    if(this.marker) {
      this.marker.setPosition(new google.maps.LatLng(position.lat,position.lng));
    } else {
      this.marker = new google.maps.Marker({
        draggable: this.edit,
        animation: google.maps.Animation.DROP,
        position: position,
        map: this.map,
        // icon: this.getMarkerIcon()
      });

      if(this.edit) {
        google.maps.event.addListener(this.marker, 'dragend', () => {
          const position = {
            lat: this.marker.position.lat(),
            lng: this.marker.position.lng()
          };
          this.setPosition(position);
          this.findAddress(position);
        });
      }
    }

    this.setLatitude(position.lat);
    this.setLongitude(position.lng);
    this.latLngDefined();


    // Center map
    this.map.setCenter(position);

    this.pageService.hideLoading();

  }

  latLngDefined() {
  }

  isAddressDefined() {
    if(this.address && this.addressGoogle && this.latitude && this.longitude && this.extraValuesDefined()) return true;
    return false;
  }

  extraValuesDefined() {
    return true;
  }

  changeAddress(event) {
    this.setAddress(event.target.value);
  }

  findAddressUser() {
    this.geocoder.geocode({address: this.addressUser}, (addresses, status) => {
      if (status === 'OK' && addresses[0] && addresses[0].geometry && addresses[0].geometry.location) {
        const position = {
          lat: addresses[0].geometry.location.lat(),
          lng: addresses[0].geometry.location.lng()
        };
        this.setPosition(position);
        this.updateAddress(addresses);
      }
    });
  }

  findAddressByText(text) {
    this.geocoder.geocode({address: text}, (addresses, status) => {
      if (status === 'OK' && addresses[0] && addresses[0].geometry && addresses[0].geometry.location) {
        const position = {
          lat: addresses[0].geometry.location.lat(),
          lng: addresses[0].geometry.location.lng()
        };
        this.setPosition(position);
        this.updateAddress(addresses);
      }
    });
  }

  findAddress(location){
    this.geocoder.geocode({location: location}, (addresses, status) => {
      this.updateAddress(addresses);
    });
  }

  updateAddress(addresses) {
    this.zone.run(() => {
      console.log(addresses);
      if (addresses && addresses[0]) {
        this.setAddressGoogle(addresses[0].formatted_address);
      } else {
        this.setAddressGoogle(null);
      }
      this.setAddress(this.getAddressGoogle());
      this.addressUpdated();
    });
  }

  addressUpdated() {
  }

  setAddress(address) {
    this.address = address;
  }

  setAddressGoogle(addressGoogle) {
    this.addressGoogle = addressGoogle;
  }

  getAddressGoogle() {
    return this.addressGoogle;
  }

  setLatitude(latitude) {
    this.latitudeLast = this.latitude;
    this.latitude = latitude;
  }

  setLongitude(longitude) {
    this.longitudeLast = this.longitude;
    this.longitude = longitude;
  }

  getLatLng() {
    if(this.latitude && this.longitude)
      return new google.maps.LatLng(this.latitude, this.longitude);
    return;
  }

  getLatLngLast() {
    if(this.latitudeLast && this.longitudeLast)
      return new google.maps.LatLng(this.latitudeLast, this.longitudeLast);
    return;
  }

  getMapOptions() {
    let mapOptions:any = {
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }],
      disableDoubleClickZoom: false,
      disableDefaultUI: true,
      // zoomControl: true,
      scaleControl: true,
    };
    return mapOptions;
  }

  getMarkerIcon() {
    let markerIcon : any = {
      // path: this.settings.GM_ICON_PATH,
      fillColor: '#f5c357',
      fillOpacity: 0.8,
      scale: .5
    };
    return markerIcon;
  }

  getPositionFromPlace(placeId) {
    return new Promise(async (resolve, reject) => {
      this.geocoder.geocode({ placeId: placeId }, (addresses, status) => {
        if (status === 'OK' && addresses[0] && addresses[0].geometry && addresses[0].geometry.location) {
          const position = {
            lat: addresses[0].geometry.location.lat(),
            lng: addresses[0].geometry.location.lng()
          };
          resolve(position);
        } else {
          reject({ message: 'No se puede obtener la ubicacion', status: status });
        }
      });
    });
  }

  getAddressNames(address) {
    let names:any = {};
    names.full = address;
    names.short = "";
    let terms = names.full.split(",");
    const termsLength = terms.length;
    if(termsLength == 1) {
      names.short = terms[0].trim();
    } else if(termsLength > 1){
      names.short = terms[termsLength - 2].trim() + ", " + terms[termsLength - 1].trim();
    }
    return names;
  }
}
