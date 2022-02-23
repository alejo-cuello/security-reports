import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.page.html',
  styleUrls: ['./institutions.page.scss'],
})
export class InstitutionsPage extends BasePage implements OnInit {
  
  securityInstitutions: any[] = [];
  healthInstitutions: any[] = [];

  menu: string = 'security';

  loadingSecurity: boolean = true;
  loadingHealth: boolean = true;

  totalSecurityInstitutions: number = 0;
  totalHealthInstitutions: number = 0;

  offsetSecurityInstitutions: number = 0;
  offsetHealthInstitutions: number = 0;

  querySecurityInstitutions: string = '';
  queryHealthInstitutions: string = '';

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  ngOnInit(): void {
    this.getSecurityInstitutions();
    this.getHealthInstitutions();
  }

  segmentChanged() {
    if ( this.menu === 'security' ) {
      this.querySecurityInstitutions = '';
      this.getSecurityInstitutions();
    } else {
      this.queryHealthInstitutions = '';
      this.getHealthInstitutions();
    }
  }

  getSecurityInstitutions(loadMore = false) {
    if ( loadMore ) {
      this.offsetSecurityInstitutions += 6;
    };
    this.pageService.httpGetAllWithFilters('institutions/security', this.offsetSecurityInstitutions, this.querySecurityInstitutions)
      .then( (response) => {
        if ( this.offsetSecurityInstitutions > 0 ) {
          this.securityInstitutions.push(...response.institutions);
        } else {
          this.securityInstitutions = response.institutions;
        };
        this.totalSecurityInstitutions = response.total;
        this.loadingSecurity = false;
      })
      .catch( (error) => {
        this.securityInstitutions = [];
      })
  };


  getHealthInstitutions(loadMore = false) {
    if ( loadMore ) {
      this.offsetHealthInstitutions += 6;
    };
    this.pageService.httpGetAllWithFilters('institutions/health', this.offsetHealthInstitutions, this.queryHealthInstitutions)
      .then( (response) => {
        if ( this.offsetHealthInstitutions > 0 ) {
          this.healthInstitutions.push(...response.institutions);
        } else {
          this.healthInstitutions = response.institutions;
        };
        this.totalHealthInstitutions = response.total;
        this.loadingHealth = false;
      })
      .catch( (error) => {
        this.healthInstitutions = [];
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
    let value = event.detail.value;
    this.offsetSecurityInstitutions = 0;
    this.offsetHealthInstitutions = 0;
    if ( this.infiniteScroll ) {
      this.infiniteScroll.disabled = false;
    };
    if ( value === '' ) {
      this.querySecurityInstitutions = '';
      this.getSecurityInstitutions();
      this.queryHealthInstitutions = '';
      this.getHealthInstitutions();
      return;
    };
    if ( this.menu === 'security' ) {
      this.querySecurityInstitutions = value;
      this.getSecurityInstitutions();
    } else {
      this.queryHealthInstitutions = value;
      this.getHealthInstitutions();
    };
  };

}
