import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { PageService } from 'src/app/core/page.service';
import { MapOptionsPage } from '../map-options/map-options.page';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})

export class MapPage extends BasePage {  

  coordinates: any;
  lastOption: string = '';
  marker: any;
  markers: any[] = [];
  map: any;
  places: any = [];
  role: string;
  street: string;
  streetNumber: string;

  constructor(
    public pageService: PageService,
    public router: Router
  ) {
    super(pageService);
  }

  ionViewWillEnter() {
    this.role = this.global.load(this.settings.storage.role);
    this.hideMenu = this.pageService.global.load(this.settings.storage.hideMenu);
    this.map = L.map('map').setView(this.settings.coordinates.rosario, 17);

    this.setInitialValues();

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
    ).addTo(this.map);

    this.map.on("click", (data: any) => {
      if(!this.handleClickOptions(data)) {
        if(this.marker) this.marker.removeFrom(this.map);
        this.marker = new L.Marker([data.latlng.lat, data.latlng.lng]).addTo(this.map);
  
        this.coordinates = [data.latlng.lat, data.latlng.lng];
  
        const endPoint = this.settings.endPoints.map
          + this.settings.endPointsMethods.map.getAddress
          + '/' + data.latlng.lat
          + '&' + data.latlng.lng;
  
        this.pageService.httpGet(endPoint)
          .then( (response) => {
            this.street = response.street;
            this.streetNumber = response.streetNumber;
          })
          .catch( (error) => {
            console.log(error);
          })
      }
    })
  }

  ionViewWillLeave() {
    this.pageService.global.remove(this.settings.storage.hideMenu);
    this.map.off();
    this.map.remove();
  }

  handleClickOptions(data: any) {
    //Este return false es para que ponga un marcador donde toque el usuario
    if(!data.originalEvent.target.alt) return false;
    else{
      if(data.originalEvent.target.alt.includes('institution')) {
        // Acá podemos hacer alguna acción cuando se toca una institución
        // this.pageService.showSuccess(data.originalEvent.target.alt.split('.')[1]);
      }
      else if(data.originalEvent.target.alt.includes('claim')) {
        let id = data.originalEvent.target.alt.split('.')[1];
        this.pageService.navigateRoute( 'claim', { queryParams: { action: 'watch', id, role: this.role, type: 'claim' } } );
      }
      else if(data.originalEvent.target.alt.includes('insecurityFact')) {
        let id = data.originalEvent.target.alt.split('.')[1];
        this.pageService.navigateRoute( 'claim', { queryParams: { action: 'watch', id, role: this.role, type: 'insecurityFact' } } );
      }
      return true;
    }
  }

  setInitialValues() {
    this.street = this.global.load(this.settings.storage.street);
    this.streetNumber = this.global.load(this.settings.storage.streetNumber);
    this.coordinates = this.global.load(this.settings.storage.coordinates);

    if(this.marker) this.marker.removeFrom(this.map);
    
    if(this.coordinates) {
      this.marker = new L.Marker(this.coordinates).addTo(this.map);
    }
  }

  goToClaims() {
    if(this.street && this.streetNumber) {
      this.global.save(this.settings.storage.street, this.street);
      this.global.save(this.settings.storage.streetNumber, this.streetNumber);
      this.global.save(this.settings.storage.coordinates, this.coordinates);

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
      if(data.data != this.lastOption) {
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
    for(let marker of this.markers) {
      marker.removeFrom(this.map);
    }
  }

  getInstitutions(institutionsType: string) {
    this.pageService.httpGetAllWithFilters('institutions/' + institutionsType, 0, '', 100)
      .then( (response) => {
        this.places = response.institutions;
        for(let place of this.places) {
          if(place.geojson) {
            let coordinates = place.geojson.geometry.coordinates;
            let markerCoordinates: any = [ coordinates[1], coordinates[0] ];
            this.markers.push(
              new L.Marker(
                markerCoordinates,
                {
                  riseOnHover: true,
                  title: place.name,
                  alt: 'institution.' + place.contactos
                })
                .addTo(this.map));
          }
        }
      })
      .catch( (error) => {
        this.places = [];
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
      this.places = [];
    })
  }

  getInsecurityFacts() {
    let endPoint = this.settings.endPoints.insecurityFact + this.settings.endPointsMethods.insecurityFact.insecurityFactsForMap;

    this.pageService.httpGetAll(endPoint)
    .then( (response) => {
      this.places = response;
      this.setMarkers('insecurityFact');
    })
    .catch( (error) => {
      this.places = [];
    })
  }

  setMarkers(type: string) {
    for(let place of this.places) {
      if(place.longitude && place.latitude) {
        let coordinates: any = [place.latitude, place.longitude];
        this.markers.push(
          new L.Marker(
            coordinates,
            {
              riseOnHover: true,
              title: place.CSCdescription || place.insecurityFactType.IFTdescription,
              alt: type + '.' + place.claimId
            })
            .addTo(this.map));
      }
    }
  }
}
