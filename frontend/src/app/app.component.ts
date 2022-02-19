import { Component } from '@angular/core';
import { GlobalService } from './core/global.service';
import { PageService } from './core/page.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    public pageService: PageService,
    public global: GlobalService,
  ){
  }

  public appPages = [
    {
      title: 'Mis reclamos favoritos',
      url: '/tabs/claims',
      icon: 'list-outline'
    },
    {
      title: 'Instituciones',
      url: '/institutions',
      icon: 'business-outline'
    },
    {
      title: 'Mis contactos',
      url: '/contacts',
      icon: 'call-outline'
    },
    {
      title: 'Cerrar sesión',
      url: '/login',
      icon: 'log-out-outline'
    }
  ];

  navigateTo( url: string ) {
    if ( url === '/login' ) {
      this.global.removeUser(); // Elimina el usuario del localStorage
      this.global.remove('securityReports.role'); // Elimina el rol del usuario del localStorage
      this.global.remove('securityReports.token'); // Elimina el token del localStorage
    }
    this.pageService.navigateRoute( url );
  }

  sendMessage() {
    let message = 'Hola, necesito ayuda!';
    message = message.replace(' ','%20');
    this.pageService.iab.create('https://wa.me/5493462603682?text=' + message, "_system");
  }

}
