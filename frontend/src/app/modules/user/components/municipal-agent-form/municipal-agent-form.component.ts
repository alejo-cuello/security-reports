import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';

@Component({
  selector: 'app-municipal-agent-form',
  templateUrl: './municipal-agent-form.component.html',
  styleUrls: ['./municipal-agent-form.component.scss'],
})
export class MunicipalAgentFormComponent extends FormPage {

  // @Input() queryParam: string;
  @Input() creating: boolean;
  @Input() form: FormGroup;

  onSubmitPerform() {}

}
