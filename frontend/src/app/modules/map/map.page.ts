import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { PageService } from 'src/app/core/page.service';
import { MapOptionsPage } from '../map-options/map-options.page';
import { icon, latLng, marker, tileLayer } from 'leaflet';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})

export class MapPage extends BasePage {  

  coordinates: any;
  hideMenu: boolean;
  lastOption: string = '';
  marker: any;
  markers: any[] = [];
  map: any;
  places: any = [];
  role: string;
  street: string;
  streetNumber: string;

  layers: any = [];
  icon: any;

  options: any = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    ],
    zoom: 15,
    center: latLng(-32.94728264360368, -60.64127184874043)
  };

  constructor(
    public pageService: PageService,
    public activatedRoute: ActivatedRoute
  ) {
    super(pageService);
  }

  ionViewWillEnter() {
    this.role = this.global.load(this.settings.storage.role);
    this.hideMenu = this.pageService.router.url.includes('hideMenu=true');
    this.icon = icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "../../../assets/imgs/marker-icon.png",
      shadowUrl: "../../../assets/imgs/marker-shadow.png",
    });
  }

  ionViewWillLeave() {
    this.lastOption = undefined;
  }

  onMapReady(map: L.Map) {
    this.global.showLoading();
    setTimeout(() => {
      map.invalidateSize();
      this.global.hideLoading();
    }, 100);
  }

  onClick(event: any) {
    if(!this.hideMenu) {
      this.handleClickOptions(event);
    }
    else{
      this.layers = [
        marker([event.latlng.lat, event.latlng.lng], {icon: this.icon})
      ];

      this.coordinates = [event.latlng.lat, event.latlng.lng];

      const endPoint = this.settings.endPoints.map
        + this.settings.endPointsMethods.map.getAddress
        + '/' + event.latlng.lat
        + '&' + event.latlng.lng;

      this.pageService.httpGet(endPoint)
        .then( (response) => {
          this.street = response.street;
          this.streetNumber = response.streetNumber;
        })
        .catch( (error) => {
          this.pageService.showError(error);
        })
    }
  }

  handleClickOptions(data: any) {
    if(data.originalEvent.target.alt) {
      if(data.originalEvent.target.alt.includes('institution')) {
        // Acá podemos hacer alguna acción cuando se toca una institución
        // this.pageService.showSuccess(data.originalEvent.target.alt.split('.')[1]);
      }
      else if(data.originalEvent.target.alt.includes('claim')) {
        let id = data.originalEvent.target.alt.split('.')[1];
        let action = this.role === 'neighbor'
          ? 'watch'
          : 'edit';
        this.pageService.navigateRoute( 'claim', { queryParams: { action, id, role: this.role, type: 'claim' } } );
      }
      else if(data.originalEvent.target.alt.includes('insecurityFact')) {
        let id = data.originalEvent.target.alt.split('.')[1];
        this.pageService.navigateRoute( 'claim', { queryParams: { action: 'watch', id, role: this.role, type: 'insecurityFact' } } );
      }
    }
  }

  setInitialValues() {

    let addressInfo = this.global.load(this.settings.storage.addressInfo);

    if(addressInfo) {
      this.street = addressInfo.street;
      this.streetNumber = addressInfo.streetNumber;
      this.coordinates = addressInfo.coordinates;
    }
    
    if(this.coordinates) {
      this.layers = [
        marker(this.coordinates, {icon: this.icon})
      ];
    }
  }

  goToClaims() {
    if(this.street && this.streetNumber) {
      let addressInfo = {
        street: this.street,
        streetNumber: this.streetNumber,
        coordinates: this.coordinates
      }
      this.global.save(this.settings.storage.addressInfo, addressInfo);

      this.pageService.navigateBack();
    }
    else {
      this.pageService.showError('Por favor marque la posición en el mapa y complete los campos');
    }
  }

  async openMapOptions() {
    const modal = await this.pageService.modalCtrl.create({
      component: MapOptionsPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { selectedOption: this.lastOption }
    });

    modal.onDidDismiss().then( (data) => {
      if(data.data && data.data != this.lastOption) {
        this.removeMarkers();
        
        if(data.data && data.data == 'health')  this.getInstitutions(data.data);
        else if(data.data && data.data == 'security')  this.getInstitutions(data.data);
        else if(data.data && data.data == 'claims')  this.getClaims();
        else if(data.data && data.data == 'insecurityFacts')  this.getInsecurityFacts();
      }

      if(data.data && data.data != '') this.lastOption = data.data;
    });

    await modal.present();
  }

  removeMarkers() {
    this.layers = [];
  }

  getInstitutions(institutionsType: string) {
    this.pageService.httpGetAllWithFilters('institutions/' + institutionsType, 0, '', 100)
      .then( (response) => {
        this.places = response.institutions;
        if(this.places.length === 0) this.pageService.showError('No se han encontrado instituciones');
        for(let place of this.places) {
          if(place.geojson) {
            let coordinates = place.geojson.geometry.coordinates;
            let markerCoordinates: any = [ coordinates[1], coordinates[0] ];
            this.layers.push(
              marker(
                markerCoordinates,
                {
                  riseOnHover: true,
                  title: place.name,
                  alt: 'institution.' + place.contactos,
                  icon: this.icon
                })
                );
          }
        }
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  getClaims() {
    let endPoint = this.settings.endPoints.claim;
    
    endPoint += this.role === 'neighbor'
      ? this.settings.endPointsMethods.claim.claimsForMap
      : this.settings.endPointsMethods.claim.pending;

    this.pageService.httpGetAll(endPoint)
    .then( (response) => {
      this.places = response;
      this.setMarkers('claim');
    })
    .catch( (error) => {
      this.pageService.showError(error);
    })
  }

  getInsecurityFacts() {
    let endPoint = this.settings.endPoints.insecurityFact;
    
    endPoint += this.role === 'neighbor'
      ? this.settings.endPointsMethods.insecurityFact.insecurityFactsForMapForNeighbor
      : this.settings.endPointsMethods.insecurityFact.insecurityFactsForMapForMunicipalAgent;

    this.pageService.httpGetAll(endPoint)
    .then( (response) => {
      this.places = response;
      this.setMarkers('insecurityFact');
    })
    .catch( (error) => {
      this.pageService.showError(error);
    })
  }

  setMarkers(type: string) {
    if(this.places.length === 0) {
      const word = type === 'claim' ? 'reclamos' : 'hechos de inseguridad'
      this.pageService.showError('No se han encontrado ' + word);
    }
    for(let place of this.places) {
      if(place.longitude && place.latitude) {
        let coordinates: any = [place.latitude, place.longitude];
        this.layers.push(
          marker(
            coordinates,
            {
              riseOnHover: true,
              title: place.CSCdescription || place.insecurityFactType.IFTdescription,
              alt: type + '.' + place.claimId,
              icon: this.icon
            })
            );
      }
    }
  }
}
