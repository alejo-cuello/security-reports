import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})

export class UserPage extends ItemPage {

  creating: boolean = true;
  role: string;

  ngOnInit() {
    this.role = this.global.load(this.settings.storage.role);
    this.form = this.getFormNew();
    this.initialize();
  }

  getNewPost() {
    const socialMediaValues = this.global.pop(this.settings.storage.preRegister)
    if(socialMediaValues) this.form.patchValue(socialMediaValues);
  }

  getParamId() {
    if(this.user) return this.user.id
    else return 'new';
  }

  loadItem() {
    this.form = this.getFormEdit(this.user);
    this.item = this.user;
    this.creating = false;
    this.processing = false;
  }

  getFieldId(): string {
    return this.role === 'neighbor' ? 'neighborId' : 'municipalAgentId';
  }

  getEndPoint() {
    return this.settings.endPoints.user;
  }

  getEndPointCreate() {
    return this.settings.endPoints.user + this.settings.endPointsMethods.user.signup;
  }

  getEndPointUpdate() {
    return this.settings.endPoints.user + this.settings.endPointsMethods.user.editProfileData;
  }

  getFormNew() {

    if ( this.role === 'neighbor' ) {
      return this.formBuilder.group({
        firstName: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        lastName: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        dni: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(999999999)])],
        tramiteNumberDNI: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(999999999)])],
        street: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        streetNumber: [null, Validators.compose([Validators.required, Validators.maxLength(10)])],
        apartment: [null, Validators.maxLength(3)],
        floor: [null, Validators.maxLength(3)],
        city: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        province: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        phoneNumber: [null, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
        email: [null, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
        confirmPassword: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
        termsAndConditionsAccepted: [null, Validators.requiredTrue],
        facebookId: [null],
        googleId: [null]
      });
    }

    else {
      return this.formBuilder.group({
        firstName: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        lastName: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        registrationNumber: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
        email: [null, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
        confirmPassword: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
        termsAndConditionsAccepted: [null, Validators.requiredTrue]
      });
    };
  }

  getFormEdit( user: any ) {
    if ( this.role === 'neighbor' ) {
      return this.formBuilder.group({
        neighborId: [user.neighborId, Validators.required],
        firstName: [user.firstName, Validators.compose([Validators.required, Validators.maxLength(30)])],
        lastName: [user.lastName, Validators.compose([Validators.required, Validators.maxLength(30)])],
        dni: [user.dni, Validators.compose([Validators.required, Validators.min(1), Validators.max(999999999)])],
        tramiteNumberDNI: [user.tramiteNumberDNI, Validators.compose([Validators.required, Validators.min(1), Validators.max(999999999)])],
        street: [user.street, Validators.compose([Validators.required, Validators.maxLength(30)])],
        streetNumber: [user.streetNumber, Validators.compose([Validators.required, Validators.maxLength(10)])],
        apartment: [user.apartment, Validators.maxLength(3)],
        floor: [user.floor, Validators.maxLength(3)],
        city: [user.city, Validators.compose([Validators.required, Validators.maxLength(30)])],
        province: [user.province, Validators.compose([Validators.required, Validators.maxLength(30)])],
        phoneNumber: [user.phoneNumber, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
        email: [user.email, Validators.compose([Validators.required, Validators.email])],
      });
    }

    else {
      return this.formBuilder.group({
        municipalAgentId: [user.municipalAgentId, Validators.required],
        firstName: [user.firstName, Validators.compose([Validators.required, Validators.maxLength(30)])],
        lastName: [user.lastName, Validators.compose([Validators.required, Validators.maxLength(30)])],
        registrationNumber: [user.registrationNumber, Validators.compose([Validators.required, Validators.maxLength(30)])]
      });
    };
  }

  createdItemMessage() {
    this.pageService.showSuccess('Bienvenido!');
  }

  savePreCheck(item) {
    if (item.password != item.confirmPassword) {
      this.pageService.showError('Las contraseñas deben coincidir');
      return false;
    }

    return true;
  }

  savePre(item) {
    delete item.passwordVerify;
    item.role = this.role;

    if(!this.creating) {
      if(this.role == 'neighbor') {
        delete item.dni;
        delete item.tramiteNumberDNI;
        delete item.email;
        if(item.phoneNumber)  item.phoneNumber = item.phoneNumber.toString();
      }
      else {
        delete item.registrationNumber;
      }
    }

    if ( this.role === 'neighbor' && this.creating ) {
      item.dni = item.dni.toString();
      item.tramiteNumberDNI = item.tramiteNumberDNI.toString();
      if(item.phoneNumber)  item.phoneNumber = item.phoneNumber.toString();
      if(item.googleId || item.facebookId)  item.emailIsVerified = true;
    }
  }

  savePost(res) {
    if (this.creating) {
      let message = '¡Registro exitoso! ';

      message += ( this.role === 'neighbor' ) ?
        (this.form.value.facebookId || this.form.value.googleId) ?
          ''
          : 'Confirme su email para poder ingresar'
        : 'Espere la confirmación del municipio';

      this.pageService.showSuccess(message);

      if(!res.registerWithSocialMedia) {
        this.pageService.navigateRoute('login');
      }
      else {
        this.pageService.continueLogin(res.registerWithSocialMedia);
      }
    }
    else {
      this.pageService.showSuccess('Cambios guardados exitosamente');
      this.global.saveUser(res); // Guarda el usuario actualizado en el localStorage
      this.pageService.navigateRoute('tabs/claims');
    }
  }
}
