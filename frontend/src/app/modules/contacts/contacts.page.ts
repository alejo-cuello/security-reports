import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage extends BasePage {

  contacts = [
    {
      name: 'Jorge Perez',
      number: '15151515'
    },
    {
      name: 'Roberto Ramirez',
      number: '15202020'
    }
  ];
  
  refreshContacts() {
    this.pageService.showSuccess('¡Contactos actualizados exitosamente!');
  }

}

