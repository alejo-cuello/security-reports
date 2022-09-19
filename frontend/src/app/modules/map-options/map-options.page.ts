import { Component, Input } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.page.html',
  styleUrls: ['./map-options.page.scss'],
})
export class MapOptionsPage extends BasePage {

  @Input() selectedOption: string;
  role: string;

  ionViewWillEnter() {
    this.role = this.global.load(this.settings.storage.role);
  }

  closeModal(selectedOption: boolean = false) {
    this.pageService.modalCtrl.dismiss(selectedOption ? this.selectedOption : '');
  }
}
