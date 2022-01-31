import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institution',
  templateUrl: './institution.page.html',
  styleUrls: ['./institution.scss'],
})
export class InstitutionPage extends BasePage {
  addresses = [];
}

