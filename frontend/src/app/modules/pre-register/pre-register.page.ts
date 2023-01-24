import { FormPage } from 'src/app/core/form.page';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PageService } from 'src/app/core/page.service';

@Component({
  selector: 'app-pre-register',
  templateUrl: './pre-register.page.html',
  styleUrls: ['./pre-register.page.scss'],
})
export class PreRegisterPage extends FormPage {
  
  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService,
  ) {
    super(formBuilder, pageService);
    this.form = this.getFormNew();
  }

  onSubmitPerform() {}

  getFormNew() {
    return this.formBuilder.group({
      role: [null, Validators.required],
    });
  };

  goToRegister() {
    this.formSubmitAttempt = true;
    if ( this.form.valid ) {
      this.global.save(this.settings.storage.role, this.form.value.role);
      this.pageService.navigateRoute('/register');
    }
    else {
      this.pageService.showError('Seleccione un rol');
    }
  };

}
