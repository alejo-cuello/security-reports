import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})

export class UserPage extends FormPage {

  creating: boolean = true;
  role: string;

  constructor(
    public pageService: PageService,
    public formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute
  ){
    super(formBuilder, pageService);
    this.activatedRoute.queryParams.subscribe( (params) => {
      this.role = params.role;
      if(!this.role) {
        this.creating = false;
        // this.role = this.user.role;
      }
      this.form = this.getFormNew();
    });
  }

  getEndPoint() {
    return this.settings.endPoints.users;
  }

  getFormNew() {
    if ( this.role === 'neighbor' ) {
      return this.formBuilder.group({
        role: [this.role, Validators.required],
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
    }

    else {
      return this.formBuilder.group({
        role: [this.role, Validators.required],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        registrationNumber: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        termsAndConditionsAccepted: [null, Validators.required]
      });
    };
  }

  onSubmitPerform(item: any) {

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
