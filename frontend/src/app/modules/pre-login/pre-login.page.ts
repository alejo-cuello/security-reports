import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-pre-login',
  templateUrl: './pre-login.page.html',
  styleUrls: ['./pre-login.page.scss'],
})
export class PreLoginPage extends FormPage implements OnInit {

  queryString: URLSearchParams;
  token: string;
  socialMedia: string;

  @ViewChild('loginWithSocialMediaForm') loginWithSocialMediaForm: NgForm;

  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService,
    private menuController: MenuController
  ) { 
    super(formBuilder, pageService);
    this.form = this.getFormNew();
    this.menuController.enable(false);
  }

  ngOnInit() {
    this.queryString = this.pageService.getQueryString();
    this.token = this.queryString.get('token');
    this.socialMedia = this.queryString.get('socialMedia');
    this.global.save(this.settings.storage.token, this.token); // Guarda el token del usuario en el localStorage
  }

  getFormNew() {
    return this.formBuilder.group({
      role: ['neighbor', Validators.required]
    });
  }

  onSubmitPerform(item) {
    const endPoint = this.settings.endPoints.user + this.settings.endPointsMethods.user.loginWithSocialMedia;
    this.pageService.httpPost(endPoint, item).then( (res) => {
      this.global.saveUser(res.user); // Guarda el usuario en el localStorage
      this.global.save(this.settings.storage.role, this.form.value.role); // Guarda el rol del usuario en el localStorage
      this.global.save(this.settings.storage.token, this.token); // Guarda el token del usuario en el localStorage
      this.global.save(this.settings.storage.contacts, res.neighborContacts);
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
    this.loginWithSocialMediaForm.ngSubmit.emit();
  }

  initializeForm() {
    this.form.reset();
  }

  goToLogin() {
    this.global.remove('securityReports.token'); // Elimina el token del localStorage
    this.pageService.navigateRoute('login');
  }
}
