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
      contactId: 1,
      name: 'Jorge Perez',
      phoneNumber: '15151515'
    },
    {
      contactId: 2,
      name: 'Roberto Ramirez',
      phoneNumber: '15202020'
    }
  ];
  
  refreshContacts() {
    this.contacts = [
      {
        contactId: 1,
        name: 'Jorge Perez',
        phoneNumber: '15151515'
      },
      {
        contactId: 2,
        name: 'Roberto Ramirez',
        phoneNumber: '15202020'
      }
    ];
    this.pageService.showSuccess('¡Contactos actualizados exitosamente!');
  }

  deleteContact(contactId: number) {
    this.contacts = this.contacts.filter(contact => contact.contactId !== contactId);
    this.pageService.showSuccess('¡Contacto eliminado correctamente!');
  }

  addContact() {
    this.pageService.navigateRoute('/contacts/add-contact');
  }

}

