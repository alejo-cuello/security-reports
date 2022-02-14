import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-neighbor-form',
  templateUrl: './neighbor-form.component.html',
  styleUrls: ['./neighbor-form.component.scss'],
})
export class NeighborFormComponent implements OnInit {

  // @Input() queryParam: string;
  @Input() creating: boolean;
  @Input() form: FormGroup;

  constructor() { }

  ngOnInit() {}

}
