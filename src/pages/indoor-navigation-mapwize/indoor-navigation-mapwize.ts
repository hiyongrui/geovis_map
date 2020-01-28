import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

declare var MapwizeUI;

@Component({
  selector: 'page-indoor-navigation-mapwize',
  templateUrl: 'indoor-navigation-mapwize.html',
})
export class IndoorNavigationMapwizePage {

  //https://data.gov.sg/dataset/hdb-carpark-information?view_id=398e65ae-e2cb-4312-8651-6e65d6f19ed1&resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c
  //https://data.gov.sg/dataset/carpark-availability
  // go to api https://api.data.gov.sg/v1/transport/carpark-availability, view in json viewer awesome chrome
  //https://developers.google.com/maps/documentation/javascript/heatmaplayer

  constructor(public navCtrl: NavController, public platform: Platform, public http: HttpClient) {

  }
  
  ionViewDidEnter() {
    this.loadMap();
  }

  async loadMap() {
    await this.platform.ready();
    MapwizeUI.map({
      container: 'mapwize',
      apiKey: "cd1854a63077d894601dc9496eb6a129",
      zoom: 19,
      centerOnVenueId: "5e272d1fff0315001655115b"
    }).then(mapInstance => {
      console.log('Maps is now ready to be used')
      // mapInstance.centerOnVenue("5e272d1fff0315001655115b");
      //https://github.com/Mapwize/mapwize-ui-js/blob/master/src/index.html
    }).catch(err => {
      // Something bad happened during Mapwize loading
      console.error(err);
    });
  }

}





  //leaflet not in used
  /*
  import { Geolocation } from '@ionic-native/geolocation';
  import leaflet from 'leaflet';
  @ViewChild('mapid') mapContainer: ElementRef;
  map: any;
  markers = [];
  loadLeafletMap() {
    this.map = leaflet.map("mapid").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);


    this.map.locate({
      setView: true,
      maxZoom: 10
    }).on('locationfound', (e) => {

    });

    let markerGroup = leaflet.featureGroup();

    let testMarker = leaflet.marker([1.3633449, 103.85641989999999]);
    markerGroup.addLayer(testMarker);

    this.map.addLayer(markerGroup);

    this.http.get("https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=100").subscribe(data => {
      console.warn("data", data);
      console.error("result", data["result"]["records"]);
      data["result"]["records"].forEach(element => {
        console.log(element)
        // let newMarker = new L.latLng(element.x_coord, element.y_coord);
        this.http.get("https://developers.onemap.sg/commonapi/convert/3414to4326?X=" + element.x_coord + "&Y=" + element.y_coord).subscribe(convertedWSG84 => {
          // console.log(convertedWSG84);
          let newMarker = leaflet.marker([convertedWSG84["latitude"], convertedWSG84["longitude"]]);
          markerGroup.addLayer(newMarker);
        })
        // this.markers.push([element.y_coord, element.x_coord]);
        // this.markers.push([newMarker]);
      });
      console.warn('finish', this.markers);


      
    })
  }
  */
