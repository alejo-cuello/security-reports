import { Component } from '@angular/core';
import { GlobalService } from './core/global.service';
import { PageService } from './core/page.service';
import { MenuController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  role: string = "";
  user: any;
  userFirstName: string = "";
  userLastName: string = "";
  userEmail: string = "";

  isLoading = false;
  isLoadingProcessing = false;
  loading: any;

  constructor(
    public pageService: PageService,
    public global: GlobalService,
    public menuController: MenuController,
    private platform: Platform
  ){
    this.pageService.global.getLoadingAsObservable().subscribe( async (result) => result ? await this.showLoading() : this.hideLoading());
    this.initialize();
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
      title: 'Números de emergencia',
      url: '/emergency-numbers',
      icon: 'information-circle-outline'
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
      title: 'Reportes',
      url: '/reports',
      icon: 'analytics-outline'
    },
    {
      title: 'Cerrar sesión',
      url: '/login',
      icon: 'log-out-outline'
    }
  ];

  initialize() {
    this.platform.ready().then(() => {
      this.user = this.pageService.global.getUser();

      if (!this.user) {
        this.pageService.navigateRoute('login');
      }
      else {
        this.pageService.navigateRoute('tabs/claims');
      }
    });
  }

  handleAction( url: string ) {
    if(url === '/login') this.pageService.logout();
    else this.navigateTo(url);
  }

  navigateTo( url: string ) {
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
      for(let contact of contacts) {
        this.pageService.iab.create('https://wa.me/549' +  contact.phoneNumber + '?text=' + message, "_system");
      }
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

  async showLoading(content = 'Procesando...') {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.isLoadingProcessing = true;
    
    this.loading = await this.pageService.loadingController.create({ message: content });
    await this.loading.present();
    this.isLoadingProcessing = false;
  }

  hideLoading() {
    if (this.isLoadingProcessing) return setTimeout(() => this.hideLoading(), 100);
    if (this.loading) this.loading.dismiss();
    this.isLoading = false;
  }
}
