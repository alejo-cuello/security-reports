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
    return this.formBuilder.group({
      id: [null],
      fullName: [null, Validators.required],
      phoneNumber: [null, Validators.required],
      emailAddress: [null, Validators.compose([Validators.required])],
      businessName: [null],
      contactType: [null, Validators.required],
      password: [null,Validators.compose([Validators.required, Validators.minLength(4)])],
      passwordVerify: [null, Validators.compose([Validators.required, Validators.minLength(4)])]
    });
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
      this.pageService.navigateRoute('home');
    }
  }

  savePostError() {
    this.pageService.hideLoading();
  }

  goToChangePassword() {
    this.pageService.navigateRoute('change-password');
  }

  goToClaims() {
    this.pageService.navigateRoute('/tabs/claims');
  }

  goToMap() {
    this.pageService.navigateRoute('/map');
  }

}
