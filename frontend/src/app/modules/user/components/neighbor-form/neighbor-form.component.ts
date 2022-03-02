import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormPage } from 'src/app/core/form.page';

@Component({
  selector: 'app-neighbor-form',
  templateUrl: './neighbor-form.component.html',
  styleUrls: ['./neighbor-form.component.scss'],
})
export class NeighborFormComponent extends FormPage {

  // @Input() queryParam: string;
  @Input() creating: boolean;
  @Input() form: FormGroup;

  onSubmitPerform() {}
}
