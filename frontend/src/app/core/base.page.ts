import { Directive } from '@angular/core';
import { PageService } from './page.service';
import { environment } from 'src/environments/environment';

@Directive({selector: '[basePage]'})
export class BasePage {

  global: any;
  settings: any;
  filesUrl = environment.filesUrl;
  user: any;

  constructor(
    public pageService: PageService
  ) {
    this.global = this.pageService.global;
    this.settings = this.pageService.global.settings;
    this.checkUser();
  }

  checkUser() {
    this.global.getUserAsObservable().subscribe((result) => {
      this.user = this.global.getUser();
    });
    this.user = this.global.checkUser();
  }

  getQueryString(data: any) {
    let queryStrings = '?';
    for (let filter in data) {
      if(data[filter]) queryStrings = queryStrings + (filter + '=' + data[filter] + '&');
    }
    return queryStrings;
  }
}
