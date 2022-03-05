import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})

export class MapPage extends BasePage {  

  coordinates: any;
  marker: any;
  map: any;
  street: string;
  streetNumber: string;

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
}
