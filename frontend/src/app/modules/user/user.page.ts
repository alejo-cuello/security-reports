import { Component } from '@angular/core';
import { ItemPage } from 'src/app/core/item.page';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})

export class UserPage extends ItemPage {

  getParamId() {
    const user = this.global.getUser();
    if (user) return user.id;
    return 'new';
  }

  getEndPoint() {
    return this.settings.endPoints.users;
  }

  getFormNew() {
    let form = this.formBuilder.group({
      role: [this.queryParam, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      dni: [null, Validators.required],
      tramiteNumberDNI: [null, Validators.required],
      street: [null, Validators.required],
      streetNumber: [null, Validators.required],
      apartment: [null],
      floor: [null],
      city: [null, Validators.required],
      province: [null, Validators.required],
      phoneNumber: [null],
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
      termsAndConditionsAccepted: [null, Validators.required]
    });

    if ( this.queryParam === 'municipalAgent' ) {
      form = this.formBuilder.group({
        role: [this.queryParam, Validators.required],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        registrationNumber: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        termsAndConditionsAccepted: [null, Validators.required]
      });
    };

    return form;
  }

  getFormEdit(item) {
    return this.formBuilder.group({
      id: [item.id],
      fullName: [item.fullName, Validators.required],
      phoneNumber: [item.phoneNumber, Validators.required],
      emailAddress: [item.emailAddress, Validators.compose([Validators.required])],
      businessName: [item.businessName],
      contactType: [item.contactType, Validators.required],
      password: [null, null],
      passwordVerify: [null, null],
    })
  }

  createdItemMessage() {
    this.pageService.showSuccess('Bienvenido!');
  }

  savePreCheck(item) {

    if (item.password != item.passwordVerify) {
      this.pageService.showError('Las contraseñas deben ser las mismas');
      return false;
    }

    return true;
  }

  savePre(item) {
    item.username = item.emailAddress;
  }

  savePostPre() {
    this.pageService.showLoading();
  }

  savePost(res) {
    this.pageService.hideLoading();
    const user = res.data;
    this.global.saveUser(user);
    if (this.creating) {
      this.pageService.navigateToHome();
    }
  }

  savePostError() {
    this.pageService.hideLoading();
  }

  goToChangePassword() {
    this.pageService.navigateRoute('change-password');
  }

  goToLogin() {
    if ( this.form.valid ) {
      this.pageService.navigateRoute('/login');
    };
  }

  goToMap() {
    this.pageService.navigateRoute('/map');
  }

}
