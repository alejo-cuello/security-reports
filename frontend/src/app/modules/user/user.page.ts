import { Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { ItemPage } from 'src/app/core/item.page';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})

export class UserPage extends ItemPage implements OnDestroy {

  creating: boolean = true;
  role: string;
  termsAndConditionsAccepted: boolean;

  ngOnInit() {
    this.termsAndConditionsAccepted = this.global.get("termsAndConditionsAccepted");
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.role = params.role;
      this.form = this.getFormNew();
      this.initialize();
    });
  }

  ngOnDestroy(): void {
    this.global.remove("termsAndConditionsAccepted");
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
        phoneNumber: [null, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
        email: [null, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        termsAndConditionsAccepted: [this.termsAndConditionsAccepted, Validators.requiredTrue]
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
        termsAndConditionsAccepted: [this.termsAndConditionsAccepted, Validators.requiredTrue]
      });
    };
  }

  getFormEdit( user: any ) {

    if ( this.role === 'neighbor' ) {
      return this.formBuilder.group({
        firstName: [user.firstName, Validators.required],
        lastName: [user.lastName, Validators.required],
        dni: [user.dni, Validators.required],
        tramiteNumberDNI: [user.tramiteNumberDNI, Validators.required],
        street: [user.street, Validators.required],
        streetNumber: [user.streetNumber, Validators.required],
        apartment: [user.apartment],
        floor: [user.floor],
        city: [user.city, Validators.required],
        province: [user.province, Validators.required],
        phoneNumber: [user.phoneNumber, Validators.compose([Validators.minLength(10), Validators.maxLength(10)])],
        email: [user.email, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required]
      });
    }

    else {
      return this.formBuilder.group({
        firstName: [user.firstName, Validators.required],
        lastName: [user.lastName, Validators.required],
        registrationNumber: [user.registrationNumber, Validators.required],
        email: [user.email, Validators.compose([Validators.required, Validators.email])],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required]
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
      if(item.phoneNumber)  item.phoneNumber = item.phoneNumber.toString();
    }
  }

  savePost(res) {
    if (this.creating) {
      let message = '¡Registro exitoso! ';

      message += ( this.role === 'neighbor' ) ?
        'Confirme su email para poder ingresar'
        : 'Espere la confirmación del municipio';

      this.pageService.showSuccess(message);
      this.pageService.navigateRoute('login');
    }
  }

  goToChangePassword() {
    this.pageService.navigateRoute('change-password');
  }
}
