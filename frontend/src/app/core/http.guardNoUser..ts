import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { GlobalService } from './global.service';
// import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class HttpGuardNoUser implements CanActivate {

  constructor(
    private global: GlobalService
  ) {
  }

  canActivate(next: any): boolean {

    const user = this.global.getUser();

    if(user && (next._routerState.url == '/login' || '/register' || '/recover-password' || '')) return false;  
    else  return true;
    
  }
}
