import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.scss'],
})
export class ContactsPage extends BasePage {

  goToContact() {
    this.pageService.navigateRoute('contact');
  }
}

