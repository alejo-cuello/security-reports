import { FormPage } from 'src/app/core/form.page';
import { Component, ViewChild } from '@angular/core';
import { ItemPage } from 'src/app/core/item.page';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
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
    this.global.remove('termsAndConditionsAccepted');
  }

  onSubmitPerform() {}

  getFormNew() {
    return this.formBuilder.group({
      role: [null, Validators.required],
      termsAndConditionsAccepted: [null, Validators.requiredTrue]
    });
  };

  goToRegister() {
    if ( this.form.valid ) {
      this.global.save('termsAndConditionsAccepted', this.form.value.termsAndConditionsAccepted);
      this.pageService.navigateRoute( '/register', { queryParams: { role: this.form.value.role } } );
    };
  };

}
