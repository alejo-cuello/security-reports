import { Component, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends FormPage  {

  @ViewChild('loginForm') loginForm: NgForm;
  
  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService,
  ) {
    super(formBuilder, pageService);
    this.form = this.getFormNew();
  }

  getFormNew() {
    return this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      role: [null, Validators.required]
    });
  }

  onSubmitPerform(item) {
    const endPoint = this.settings.endPoints.users + this.settings.endPointsMethods.users.login;
    
    this.pageService.showLoading();
    this.pageService.httpPost(endPoint, item).then( (res) => {
      this.pageService.hideLoading();
      this.global.saveUser(res.data);
      this.pageService.showSuccess('Bienvenido!');
      this.initializeForm();
    })
    .catch( (reason) => {
      this.pageService.hideLoading();
      this.pageService.showError(reason);
    });
  }

  submit() {
    this.loginForm.ngSubmit.emit();
  }

  initializeForm() {
    this.form.reset();
    this.form.patchValue({role: this.settings.roles.user});
  }

  goToRegister() {
    this.pageService.navigateRoute('register');
  }

  goToRecoverPassword() {
    this.pageService.navigateRoute('recover-password');
  }

  goToClaims() {
    this.pageService.navigateRoute('tabs/claims');
  }

}
