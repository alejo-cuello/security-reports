import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

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

  constructor() {}
}
