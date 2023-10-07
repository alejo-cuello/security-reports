import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.page.html',
  styleUrls: ['./institutions.page.scss'],
})
export class InstitutionsPage extends BasePage implements OnInit {
  
  @ViewChild(IonContent, { static: false }) content: IonContent;

  securityInstitutions: any[] = [];
  healthInstitutions: any[] = [];

  menu: string = 'security';

  loadingSecurity: boolean = true;
  loadingHealth: boolean = true;

  totalSecurityInstitutions: number = 0;
  totalHealthInstitutions: number = 0;

  offsetSecurityInstitutions: number = 0;
  offsetHealthInstitutions: number = 0;

  queryString: string = '';

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  ngOnInit(): void {
    this.getSecurityInstitutions();
  }

  segmentChanged() {
    this.content.scrollToTop(0);
    if ( this.menu === 'security' ) {
      this.healthInstitutions = [];
      this.getSecurityInstitutions();
    } else {
      this.securityInstitutions = [];
      this.getHealthInstitutions();
    }
  }

  getSecurityInstitutions(loadMore = false) {
    this.loadingSecurity = true;
    if ( loadMore ) {
      this.offsetSecurityInstitutions += 6;
    };
    this.pageService.httpGetAllWithFilters('institutions/security', this.offsetSecurityInstitutions, this.queryString, 6, false)
      .then( (response) => {
        if ( this.offsetSecurityInstitutions > 0 ) {
          this.securityInstitutions.push(...response.institutions);
        } else {
          this.securityInstitutions = response.institutions;
        };
        this.totalSecurityInstitutions = response.total;
      })
      .catch( (error) => {
        this.securityInstitutions = [];
        this.handleError(error);
      })
      .finally(() => {
        this.loadingSecurity = false;
      })
  };


  getHealthInstitutions(loadMore = false) {
    this.loadingHealth = true;
    if ( loadMore ) {
      this.offsetHealthInstitutions += 6;
    };
    this.pageService.httpGetAllWithFilters('institutions/health', this.offsetHealthInstitutions, this.queryString, 6, false)
      .then( (response) => {
        if ( this.offsetHealthInstitutions > 0 ) {
          this.healthInstitutions.push(...response.institutions);
        } else {
          this.healthInstitutions = response.institutions;
        };
        this.totalHealthInstitutions = response.total;
      })
      .catch( (error) => {
        this.healthInstitutions = [];
        this.handleError(error);
      })
      .finally(() => {
        this.loadingHealth = false;
      })
  };


  loadMoreInstitutions(loadMore, event) {
    setTimeout(() => {
      if (this.menu === 'security') {
        // * Esto es para que corte el infinite scroll cuando ya no hay mas registros
        if ( this.securityInstitutions.length >= this.totalSecurityInstitutions ) {
          event.target.complete();
          this.infiniteScroll.disabled = true;
          return;
        };
        this.getSecurityInstitutions(loadMore);
      } else {
        // * Esto es para que corte el infinite scroll cuando ya no hay mas registros
        if (this.healthInstitutions.length >= this.totalHealthInstitutions) {
          event.target.complete();
          this.infiniteScroll.disabled = true;
          return;
        };
        this.getHealthInstitutions(loadMore);
      };
      event.target.complete();
    }, 500);
  };


  onSearchChange(event) {
    this.content.scrollToTop(0);
    let value = event.detail.value;
    this.offsetSecurityInstitutions = 0;
    this.offsetHealthInstitutions = 0;
    if ( this.infiniteScroll ) {
      this.infiniteScroll.disabled = false;
    };
    if ( this.menu === 'security' ) {
      this.queryString = value;
      this.getSecurityInstitutions();
    } else {
      this.queryString = value;
      this.getHealthInstitutions();
    };
  };

}
