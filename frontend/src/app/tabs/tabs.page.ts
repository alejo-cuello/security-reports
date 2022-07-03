import { Component, ViewChild } from '@angular/core';
import { BasePage } from '../core/base.page';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage extends BasePage {

  @ViewChild('myTabs') tabs: any;

  goTo(route: string) {
    let queryParams = {};
    if( route === 'user' ) {
      let role = this.global.load(this.settings.storage.role);
      queryParams = { queryParams: { role } };
    }

    this.pageService.navigateRoute( 'tabs/' + route, queryParams );
  }

  ionViewWillEnter() {
    this.hideMenu = this.pageService.global.load(this.settings.storage.hideMenu);
    try {
      if(this.tabs.outlet.activatedView.stackId != 'map')this.tabs.outlet.activatedView.ref.instance.ionViewWillEnter();
    } catch(e) {};
  }
}
