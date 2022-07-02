import { Component, Input } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.page.html',
  styleUrls: ['./map-options.page.scss'],
})
export class MapOptionsPage extends BasePage {

  @Input() selectedOption: string;
  
  closeModal(selectedOption: boolean = false) {
    this.pageService.modalCtrl.dismiss(selectedOption ? this.selectedOption : '');
  }
}
