import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

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

  constructor() {}
}
