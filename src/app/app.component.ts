import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { CarparkHeatmapBufferingGooglemapPage } from '../pages/carpark-heatmap-buffering-googlemap/carpark-heatmap-buffering-googlemap';
import { IndoorNavigationMapwizePage } from '../pages/indoor-navigation-mapwize/indoor-navigation-mapwize';
import { ShoppingMallSearchingRoutingArcgisPage } from '../pages/shopping-mall-searching-routing-arcgis/shopping-mall-searching-routing-arcgis';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = ShoppingMallSearchingRoutingArcgisPage;

  pages: Array<{title: string, component: any}>;

  mapToggleColor = false;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public event: Events) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Shopping Malls', component: ShoppingMallSearchingRoutingArcgisPage },
      { title: 'Indoor Map', component: IndoorNavigationMapwizePage },
      {title: 'Carparks', component: CarparkHeatmapBufferingGooglemapPage}
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  toggleColorInService() {
    this.event.publish("darkMode", this.mapToggleColor);
  }
  
}
