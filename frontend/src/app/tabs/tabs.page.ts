import { Component, ViewChild } from '@angular/core';
import { BasePage } from '../core/base.page';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage extends BasePage {

  @ViewChild('myTabs') tabs: any;

  ionViewWillEnter() {
    try {
      if(this.tabs.outlet.activatedView.stackId != 'map') {
        this.tabs.outlet.activatedView.ref.instance.ionViewWillEnter();
      }
    } catch(e) { console.log(e) };
  }
}
