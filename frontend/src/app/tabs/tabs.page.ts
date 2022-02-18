import { Component } from '@angular/core';
import { BasePage } from '../core/base.page';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage extends BasePage {

  goTo(route: string) {
    console.log('goto??', route)
    let queryParams = {};
    if( route === 'user' ) {
      let role = this.global.load(this.settings.storage.role);
      queryParams = { queryParams: { role } };
    }

    this.pageService.navigateRoute( 'tabs/' + route, queryParams );
  }
}
