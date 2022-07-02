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
  showForm: boolean = false;
  street: string;
  streetNumber: string;

  constructor(
    public pageService: PageService,
    public router: Router
  ) {
    super(pageService);
    this.showForm = !this.router.url.includes('tabs');
  }

  ionViewWillEnter() {

    this.map = L.map('map').setView(this.settings.coordinates.rosario, 17);

    this.setInitialValues();

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
    ).addTo(this.map);

    this.map.on("click", (data: any) => {
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
    })
  }

  ionViewWillLeave() {
    this.map.off();
    this.map.remove();
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
        if(data.data && data.data == 'security')  this.getInstitutions(data.data);
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
            this.markers.push(new L.Marker(markerCoordinates).addTo(this.map));
          }
        }
      })
      .catch( (error) => {
        this.places = [];
      })
  };
}
