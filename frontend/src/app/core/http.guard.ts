import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GlobalService } from './global.service';
import { PageService } from 'src/app/core/page.service';

@Injectable({
  providedIn: 'root'
})
export class HttpGuard implements CanActivate {

  constructor(
    private global: GlobalService,
    private pageService: PageService
  ) {
    this.global.checkUser();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.global.get('securityReports.token'); // Trae el token guardado en el LocalStorage
    if ( state.url === '/register?role=neighbor' || state.url === '/register?role=municipalAgent' ) {
      // Con este if permitimos el acceso a la página de registro
      return true;
    }
    if (token) { // Si existe el token, deja entrar a la ruta
      return true;
    } else {
      this.pageService.navigateRoute('login'); // Si no existe el token, redirige al login
    }
  };
}