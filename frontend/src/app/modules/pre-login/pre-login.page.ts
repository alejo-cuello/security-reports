import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/core/global.service';
import { PageService } from 'src/app/core/page.service';
import { Settings } from '../../app.settings';


@Component({
  selector: 'app-pre-login',
  templateUrl: './pre-login.page.html',
  styleUrls: ['./pre-login.page.scss'],
})
export class PreLoginPage implements OnInit {

  private settings = Settings;
  queryString: URLSearchParams;
  token: string;
  role: string;

  constructor(
    private pageService: PageService,
    private global: GlobalService, 
  ) { }

  ngOnInit() {
    this.queryString = this.pageService.getQueryString();
    this.token = this.queryString.get('token');
    this.role = this.queryString.get('role');
    this.global.save(this.settings.storage.token, this.token); // Guarda el token del usuario en el localStorage
    this.global.save(this.settings.storage.role, this.role ); // Guarda el rol del usuario en el localStorage
  }

  goToClaims() {
    this.pageService.navigateRoute('tabs/claims');
  }
}
