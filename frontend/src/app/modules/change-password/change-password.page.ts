import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { FormPage } from 'src/app/core/form.page';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage extends FormPage {
  
  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService,
    private menuController: MenuController
  ) {
    super(formBuilder, pageService);
    this.form = this.getFormNew();
    this.pageService.enableMenu(false);
  }

  onSubmitPerform(item: any) {
    const endPoint = this.settings.endPoints.user + this.settings.endPointsMethods.user.changePassword;

    this.pageService.httpPut(endPoint, item)
      .then( (response) => {
        this.pageService.showSuccess(response);
        this.pageService.navigateBack();
      })
      .catch( (error) => {
        this.pageService.showError(error);
      })
  }

  getFormNew() {
    return this.formBuilder.group({
      confirmNewPassword: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      email: [null, [Validators.required, Validators.email]],
      newPassword: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      role: [null, Validators.required],
    });
  }

  goToRegister() {
    this.pageService.navigateRoute('user');
  }
}
