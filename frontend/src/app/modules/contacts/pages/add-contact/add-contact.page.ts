import { Component } from '@angular/core';
import { BasePage } from './../../../../core/base.page';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage extends BasePage {

  addContact() {
    this.pageService.showSuccess('¡Contacto agregado exitosamente!');
    this.pageService.navigateBack();
  }

  cancel() {
    this.pageService.navigateBack();
  }

}
