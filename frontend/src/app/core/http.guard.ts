import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { GlobalService } from '../core/global.service';

@Injectable({
  providedIn: 'root'
})
export class HttpGuard implements CanActivate {

  constructor (
    private global: GlobalService,
    private router: Router
  ) { }

  /**
   * Can activate
   */
  canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    return new Promise(async resolve => {

      const user = this.global.checkUser();
      const data = route.data;

      if (user) {
        const redirect = [data.redirect || 'tabs/claims'];
        if (data.noUser) resolve(this.router.createUrlTree(redirect));
        else resolve(true);
      }
      else {
        data.noUser
          ? resolve(true)
          : resolve(this.router.createUrlTree([data.redirect || 'login']));
      }
    });
  }
}