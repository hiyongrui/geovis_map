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
    const [Map, MapView, FeatureLayer, Popup, Locate, Search, Directions, GraphicsLayer, Graphic]: any = await loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/widgets/Popup',
      "esri/widgets/Locate",
      "esri/widgets/Search",
      "esri/widgets/Directions",
      "esri/layers/GraphicsLayer",
      "esri/Graphic"
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
      title: "Shopping mall: {TRADE_NAME}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "HOUSE_BLK_",
              label: "Block"
            },
            {
              fieldName: "ROAD_NAME",
              label: "Road"
            },
            {
              fieldName: "POSTAL_CD",
              label: "Postal Code"
            }
          ]
        }
      ]
    }

    shoppingMallLayers.popupTemplate = customTemplate;

    let locateBtn = new Locate({
      view: mapView
    });

     // Search widget
     var search = new Search({
      view: mapView
    });

    var directionsWidget = new Directions({
      view: mapView,
      container: "directionsWidget"
    });

    mapView.ui.add(locateBtn, {position: 'top-left'});
    mapView.ui.add(search, {position: 'top-right'});
    // mapView.ui.add(directionsWidget, {position: 'top-right', index: 2})

    map.add(shoppingMallLayers);

  }

  ngOnInit() {
    this.getGeo();
  }

  currentLocation() {
    console.log("current loc");
  }

}
