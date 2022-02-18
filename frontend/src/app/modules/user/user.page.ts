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
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.role = params.role;
      this.form = this.getFormNew();
      this.initialize();
    });
  }

  //Esta función se mantendrá así hasta que permitamos la edición de los usuarios
  getParamId() {
    return 'new';
  }

  getEndPoint() {
    return this.settings.endPoints.user;
  }

  getEndPointCreate() {
    return this.settings.endPoints.user + this.settings.endPointsMethods.user.signup;
  }

  getFormNew() {

    if ( this.role === 'neighbor' ) {
      return this.formBuilder.group({
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
        email: [null, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        termsAndConditionsAccepted: [null, Validators.requiredTrue]
      });
    }

    else {
      return this.formBuilder.group({
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        registrationNumber: [null, Validators.required],
        email: [null, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        termsAndConditionsAccepted: [null, Validators.requiredTrue]
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

    if ( this.role === 'neighbor' ) {
      item.dni = item.dni.toString();
      item.tramiteNumberDNI = item.tramiteNumberDNI.toString();
      item.phoneNumber = item.phoneNumber.toString();
      item.phoneNumber = item.phoneNumber.toString();
    }
  }

  savePost(res) {
    if (this.creating) {
      this.pageService.showSuccess('¡Registro exitoso! Confirme su email para poder ingresar');
      this.pageService.navigateRoute('login');
    }
  }

  goToChangePassword() {
    this.pageService.navigateRoute('change-password');
  }
}
