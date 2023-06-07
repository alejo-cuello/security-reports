import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.page.html',
  styleUrls: ['./add-contact.page.scss'],
})
export class AddContactPage extends ItemPage {

  getParamId() {
    return 'new';
  }

  getFormNew() {
    return this.formBuilder.group({
      name: [null, Validators.required],
      phoneNumber: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
    });
  }

  getFormEdit( item ) {
    return this.formBuilder.group({
      name: [item.name, Validators.required],
      phoneNumber: [item.phoneNumber, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])]
    });
  }

  onSubmitPerform(item) {
    const endPoint = this.settings.endPoints.contacts;

    this.pageService.httpCreate(endPoint, item)
      .then( (response) => {
        this.pageService.showSuccess('¡Contacto agregado exitosamente!');
        this.pageService.navigateBack();
      })
      .catch( (error) => {
        this.handleError(error);
      })
    }

  cancel() {
    this.pageService.navigateBack();
  }

}
