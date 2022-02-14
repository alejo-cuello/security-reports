import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-municipal-agent-form',
  templateUrl: './municipal-agent-form.component.html',
  styleUrls: ['./municipal-agent-form.component.scss'],
})
export class MunicipalAgentFormComponent implements OnInit {

  // @Input() queryParam: string;
  @Input() creating: boolean;
  @Input() form: FormGroup;

  constructor() { }

  ngOnInit() {}

}
