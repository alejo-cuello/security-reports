import { Component, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends FormPage {

  @ViewChild('loginForm') loginForm: NgForm;
  
  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService,
    private menuController: MenuController
  ) {
    super(formBuilder, pageService);
    this.form = this.getFormNew();
    this.menuController.enable(false);
  }

  getFormNew() {
    return this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      role: [null, Validators.required]
    });
  }

  onSubmitPerform(item) {
    const endPoint = this.settings.endPoints.user + this.settings.endPointsMethods.user.login;
    
    this.pageService.httpPost(endPoint, item).then( (res) => {
      this.global.saveUser(res.user); // Guarda el usuario en el localStorage
      this.global.save(this.settings.storage.role, this.form.value.role ); // Guarda el rol del usuario en el localStorage
      this.global.save(this.settings.storage.token, res.token ); // Guarda el token del usuario en el localStorage
      this.global.save(this.settings.storage.contacts, res.neighborContacts );
      this.pageService.showSuccess('Bienvenido!');
      this.menuController.enable(true);
      this.pageService.navigateRoute('tabs/claims');
      this.initializeForm();
    })
    .catch( (reason) => {
      this.pageService.showError(reason.message);
    });
  }

  submit() {
    this.loginForm.ngSubmit.emit();
  }

  initializeForm() {
    this.form.reset();
  }

  goToPreRegister() {
    this.pageService.navigateRoute('pre-register');
  }

  goToChangePassword() {
    this.pageService.navigateRoute('change-password');
  }

  goToEmergencyNumbers() {
    this.pageService.navigateRoute('emergency-numbers');
  }

}
