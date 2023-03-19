import { Component, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';
import { MenuController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

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
  }

  ionViewWillEnter() {
    this.initializeForm();
    this.addKeyboardEvents();
    this.pageService.enableMenu(false);
  }

  showError() {
    this.pageService.showError('Complete todos los campos e indique su rol');
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
      this.pageService.continueLogin(res, this.form.value.role);
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

    const FACEBOOK_PERMISSIONS = [
      'email'
    ];
    
    FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS })
      .then((res: FacebookLoginResponse) => {
        FacebookLogin.getProfile( { fields: ['email'] } )
          .then( (res: any) => {
            const endPoint = this.settings.endPoints.user + this.settings.endPointsMethods.user.loginWithFacebook;
    
            const body = {
              email: res.email,
              facebookId: res.id,
              role: 'neighbor'
            };
    
            this.pageService.httpPost(endPoint, body, 'json', true)
                .then((res) => {
                  if(res.user)  this.pageService.continueLogin(res);
                  else {
                    this.global.save(this.settings.storage.preRegister, {
                      email: body.email,
                      facebookId: body.facebookId
                    })
                    this.global.save(this.settings.storage.role, 'neighbor');
                    this.pageService.navigateRoute('/register');
                  }
                })
                .catch((err) => {
                  this.pageService.showError(err);
                  FacebookLogin.logout()
                    .then((res) => console.log(res))
                    .catch((err) => console.log(err));
                })
          })
      })
      .catch((err) => {
        console.log(err);
      })
  }

  loginWithGoogle() {
    GoogleAuth.signIn()
      .then(res => {

        const endPoint = this.settings.endPoints.user + this.settings.endPointsMethods.user.loginWithGoogle;

        const body = {
          googleId: res.id,
          email: res.email,
          role: 'neighbor'
        };

        const names = {
          firstName: res.givenName,
          lastName: res.familyName
        };

        this.pageService.httpPost(endPoint, body, 'json', true)
            .then((res) => {
              if(res.user)  this.pageService.continueLogin(res);
              else {
                this.global.save(this.settings.storage.preRegister, {
                  email: body.email,
                  googleId: body.googleId,
                  ...names
                })
                this.global.save(this.settings.storage.role, 'neighbor');
                this.pageService.navigateRoute('/register');
              }
            })
            .catch((err) => {
              this.pageService.showError(err);
              GoogleAuth.signOut()
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            })
      })
      .catch(err => {
        console.log(err);
      });
  }

}
