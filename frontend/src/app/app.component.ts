import { Component } from '@angular/core';
import { GlobalService } from './core/global.service';
import { PageService } from './core/page.service';
import { MenuController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  userFirstName: string = "";
  userLastName: string = "";
  userEmail: string = "";
  role: string = "";

  constructor(
    public pageService: PageService,
    public global: GlobalService,
    private menuController: MenuController
  ){
  }

  public appNeighborPages = [
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

  public appMunicipalAgentPages = [
    {
      title: 'Mis reclamos tomados',
      url: '/tabs/claims',
      icon: 'list-outline'
    },
    {
      title: 'Instituciones',
      url: '/institutions',
      icon: 'business-outline'
    },
    {
      title: 'Cerrar sesión',
      url: '/login',
      icon: 'log-out-outline'
    }
  ];

  navigateTo( url: string ) {
    if ( url === '/login' ) {
      this.menuController.enable(false);
      this.global.removeUser(); // Elimina el usuario del localStorage
      this.global.remove('securityReports.role'); // Elimina el rol del usuario del localStorage
      this.global.remove('securityReports.token'); // Elimina el token del localStorage
      this.global.remove('securityReports.contacts'); // Elimina el token del localStorage
    }
    this.pageService.navigateRoute( url );
  }

  sendMessage() {
    let contacts = this.global.load(this.global.settings.storage.contacts);
    
    if(!contacts || contacts.length === 0) {
      this.pageService.showWarning('Debe cargar un contacto para enviar un mensaje');
    }
    else {
      let message = 'Hola, necesito ayuda!';
      message = message.replace(' ','%20');
      this.pageService.iab.create('https://wa.me/549' +  contacts[0].phoneNumber + '?text=' + message, "_system");
    }
  }

  setUserData() {
    const user = this.global.getUser();
    if ( user ) {
      this.userFirstName = user.firstName;
      this.userLastName = user.lastName;
      this.userEmail = user.email;
    }
    const role = this.global.get('securityReports.role');
    this.translateAndSetRole(role);
  }

  translateAndSetRole(role) {
    if ( role === 'neighbor' ) {
      this.role = 'Vecino';
    };
    if ( role === 'municipalAgent' ) {
      this.role = 'Agente Municipal';
    };
  }

  loadMenuHeader() {
    this.setUserData();
  }
}
