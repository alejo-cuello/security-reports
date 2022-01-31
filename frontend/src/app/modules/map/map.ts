import { Component } from '@angular/core';
import { MapBasePage } from 'src/app/core/map-base.page';

declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.scss']
})
export class MapPage extends MapBasePage {  
}
