import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage extends BasePage {
  
  contacts: any[] = [];

  ionViewWillEnter() {
    this.getContacts();
  }

  getContacts() {
    const endPoint = this.settings.endPoints.contacts;

    this.pageService.httpGetAll(endPoint)
      .then( (response) => {
        this.contacts = response;
        this.global.save(this.settings.storage.contacts, response );

      })
      .catch( (error) => {
        this.handleError(error);
      })
  }

  refreshContacts() {
    this.pageService.showSuccess('¡Contactos actualizados exitosamente!');
  }

  deleteContact(contactId: number) {
    const endPoint = this.settings.endPoints.contacts
      + '/' + contactId;

    this.pageService.httpDelete(endPoint)
      .then( (response) => {
        this.contacts = [];
        this.getContacts();
        this.pageService.showSuccess('Contacto borrado exitosamente');
      })
      .catch( (error) => {
        this.handleError(error);
      })
  }

  addContact() {
    if(this.contacts.length === 3) {
      this.pageService.showError('No puedes agregar más contactos');
      return;
    }
    else {
      this.pageService.navigateRoute('/contacts/add-contact');
    }
  }

}

