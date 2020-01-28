import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ContactPage } from '../pages/contact/contact';
import { AboutPage } from '../pages/about/about';
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

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Shopping Mall', component: ShoppingMallSearchingRoutingArcgisPage },
      { title: 'Indoor map', component: IndoorNavigationMapwizePage },
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
}
