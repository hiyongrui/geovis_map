import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { loadModules } from 'esri-loader';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public platform: Platform) {

  }

  @ViewChild('map') mapEl: ElementRef;

  async getGeo() {

    // Reference: https://ionicframework.com/docs/api/platform/Platform/#ready
    await this.platform.ready();

    // Load the ArcGIS API for JavaScript modules
    const [Map, MapView, FeatureLayer, Popup, Locate]: any = await loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/widgets/Popup',
      "esri/widgets/Locate"
    ])
      .catch(err => {
        console.error('ArcGIS: ', err);
      });

    console.log('Starting up ArcGIS map');

    let map = new Map({
      basemap: 'osm'
    });

    var mapView = new MapView({
      container: this.mapEl.nativeElement,
      center: [103.8198, 1.3521],
      zoom: 10,
      map: map
    });

    let shoppingMallLayers = new FeatureLayer({
      url: "https://services5.arcgis.com/XqaKEQIgV03geG0E/ArcGIS/rest/services/Shopping_Malls/FeatureServer/3",
    });

    console.warn(shoppingMallLayers);


    let customTemplate = {
      title: "Shopping center: {TRADE_NAME}"
    }

    shoppingMallLayers.popupTemplate = customTemplate;

    let locateBtn = new Locate({
      view: mapView
    });

    mapView.ui.add(locateBtn, { position: 'top-left'});
    map.add(shoppingMallLayers);
  }

  ngOnInit() {
    this.getGeo();
  }

  currentLocation() {
    console.log("current loc");
  }


}
