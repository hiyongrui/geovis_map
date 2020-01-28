import { MyService } from './../providers/carparkService';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpClientModule } from '@angular/common/http';

import { CarparkHeatmapBufferingGooglemapPage } from '../pages/carpark-heatmap-buffering-googlemap/carpark-heatmap-buffering-googlemap';
import { IndoorNavigationMapwizePage } from '../pages/indoor-navigation-mapwize/indoor-navigation-mapwize';
import { ShoppingMallSearchingRoutingArcgisPage } from '../pages/shopping-mall-searching-routing-arcgis/shopping-mall-searching-routing-arcgis';

@NgModule({
  declarations: [
    MyApp,
    CarparkHeatmapBufferingGooglemapPage,
    IndoorNavigationMapwizePage,
    ShoppingMallSearchingRoutingArcgisPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CarparkHeatmapBufferingGooglemapPage,
    IndoorNavigationMapwizePage,
    ShoppingMallSearchingRoutingArcgisPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    HttpClientModule,
    MyService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
