import { Component, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';
import { MenuController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends FormPage {

  showFooter: boolean = true;

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

  ionViewWillEnter() {
    this.addKeyboardEvents();
  }

  getFormNew() {
    return this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      role: [null, Validators.required]
    });
  }

  addKeyboardEvents() {
    Keyboard.addListener('keyboardWillShow', info => {
      this.pageService.zone.run(() => this.showFooter = false);
    });
   
    Keyboard.addListener('keyboardWillHide', () => {
      this.pageService.zone.run(() => this.showFooter = true);
    });
  }

  ionViewWillLeave() {
    Keyboard.removeAllListeners()
      .catch((error) => this.pageService.showError(error));
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

  loginWithFacebook() {
    // window.open("http://localhost:3000/user/auth/facebook", "_self");
    // this.pageService.iab.create("https://proyecto-final.fly.dev/user/auth/facebook", "_system");

    const FACEBOOK_PERMISSIONS = [
      'email'
    ];
    
    FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS })
      .then((res: FacebookLoginResponse) => {
        console.log(res);
        // this.getUserWithFacebook(res.accessToken.token);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  getUserWithFacebook(accessToken: any) {
    const endPoint = this.settings.endPoints.user.loginWithFacebook;

    this.pageService.httpPost(endPoint, {accessToken}, 'json', true)
      .then((res) => {
        //if(res.user)  this.continueLogin(res);
        //else  this.pageService.navigateRoute('pre-register');
      })
      .catch((err) => {
        this.pageService.showError(err);
      })
  }

}
