import { Directive } from '@angular/core';
import { PageService } from './page.service';
import { BasePage } from './base.page';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Directive({selector: '[formPage]'})
export abstract class FormPage extends BasePage {

  form: any = {};
  formSubmitAttempt = false;

  constructor(
    public formBuilder: FormBuilder,
    public pageService: PageService
  ) {
    super(pageService);
  }

  getFormNew() {
    return this.formBuilder.group( {} );
  }

  formValidated() {
    this.formSubmitAttempt = true;
    return this.form.valid;
  }

  formReset() {
    this.form.reset();
    this.formSubmitAttempt = false;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onSubmit() {
    if (this.formValidated()) {
      this.onSubmitPerform(this.form.value);
    } else {
      this.validateAllFormFields(this.form);
      this.showError();
    }
  }

  showError() {
    //Método reescrito en login.page.ts
  }

  abstract onSubmitPerform( item );

  isFieldValid(field) {
    if(!this.form.controls[field]) return true;
    if(!this.form.controls[field].valid && this.form.controls[field].touched) return false;
    if(this.form.controls[field].untouched && this.formSubmitAttempt) return true;
    return true;
  }

  getFieldError(field) {
    let message: any = 'Validacion OK';
    if(this.form.controls[field]) {
      if(this.form.controls[field].errors) {
        let error = this.form.controls[field].errors;
        if(error.required)
          message = 'Requerido';
        else if(error.pattern)
          message = 'Solo se aceptan números';
        else if(error.minlength)
          message = 'Debe tener al menos ' + error.minlength.requiredLength + ' caracteres';
        else if(error.maxlength)
          message = 'Debe tener como máximo ' + error.maxlength.requiredLength + ' caracteres';
        else if (error.email)
          message = 'Email inválido';
        else if (error.min)
          message = 'El valor no puede ser menor a ' + error.min.min;
        else if (error.max)
          message = 'El valor no puede ser mayor a ' + error.max.max;
        else if (error.equalValue) {
          if(error.equalValue.targetKey == 'password' && error.equalValue.toMatchKey == 'passwordVerify')
            message = "Las contraseñas deben coincidir";
          else
            message = JSON.stringify(error.equalValue);
        }
        else
          message = JSON.stringify(error);
      }
    }
    return message;
  }

}
