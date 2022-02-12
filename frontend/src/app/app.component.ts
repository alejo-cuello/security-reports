import { Component } from '@angular/core';
import { PageService } from './core/page.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    public pageService: PageService
  ){
  }

  public appPages = [
    {
      title: 'Mis reclamos',
      url: '/tabs/claims',
    },
    {
      title: 'Instituciones',
      url: '/institutions',
    },
    {
      title: 'Mis contactos',
      url: '/contacts',
    },
    {
      title: 'Mi perfil',
      url: '/user'
    },
    {
      title: 'Cerrar Sesión',
      url: '/login'
    }
  ];

  sendMessage() {
    let message = 'Hola, necesito ayuda!';
    message = message.replace(' ','%20');
    this.pageService.iab.create('https://wa.me/5493462603682?text=' + message, "_system");
  }

}
