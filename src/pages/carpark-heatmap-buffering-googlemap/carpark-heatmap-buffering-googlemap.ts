import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyService } from '../../providers/carparkService';

declare var L: any;

declare var google;

interface Car {
  carpark_info: any;
  carpark_number: string;
  update_datetime: any;
}
@Component({
  selector: 'page-carpark-heatmap-buffering-googlemap',
  templateUrl: 'carpark-heatmap-buffering-googlemap.html',
})
export class CarparkHeatmapBufferingGooglemapPage {

  autocomplete = { input: '' };
  autocompleteItems = [];
  googleAutoComplete = new google.maps.places.AutocompleteService();

  geocoder = new google.maps.Geocoder;
  selectedMarker;

  @ViewChild('mapID') mapElement: ElementRef;
  map: any;
  heatmap1;
  heatmap2;
  heatmap3;
  heatmap4;
  constructor(public navCtrl: NavController, public platform: Platform, public http: HttpClient, public service: MyService, public zone: NgZone) {

  }

  ionViewDidEnter() {
    // this.getGeo()
    this.loadMap();
  }

  carparksArray = [];

  globalMarker = [];

  loadMap() {

    var infowindow = new google.maps.InfoWindow();

    var gradients = {
      yellow: [
        'rgba(255, 255, 0, 0)',
        'rgba(255, 255, 0, 1)'
      ],
      red: [
        'rgba(255, 0, 0, 0)',
        'rgba(255, 0, 0, 1)'
      ],
      green: [
        'rgba(0, 255, 0, 0)',
        'rgba(0, 255, 0, 1)'
      ],
      blue: [
        'rgba(0, 255, 0, 0)',
        'rgba(0, 0, 255, 1)'
      ]
    }

    var array1 = [];
    var array2 = [];
    var array3 = [];
    var array4 = [];

    var allData = [];


    this.service.getCarParks().then((allCarJSON: Car[]) => {
      let allCarJSONFilteredToday = allCarJSON.filter(x => x.update_datetime >= new Date().toISOString());
      this.http.get("https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=500").subscribe(data => {
        console.warn("data", data);
        console.error("result", data["result"]["records"]);

        data["result"]["records"].forEach(element => {
          // console.log(element)
          // console.warn("carpark no", element["car_park_no"]);
          let thisCar = allCarJSONFilteredToday.find(x => x["carpark_number"] === element["car_park_no"]);

          if (thisCar) {
            // console.error("thiscar", thisCar);
            // console.warn("lots avail", thisCar.carpark_info[0]["lots_available"])
            let calculation = thisCar.carpark_info[0]["lots_available"] / thisCar.carpark_info[0]["total_lots"] * 100;
            // console.warn("calclation", calculation);

            let calculatedWeight = (
              calculation >= 80 ? 60
                : (calculation > 70 && calculation < 80) ? 2
                  : (calculation > 50 && calculation <= 70) ? 1.5
                    : (calculation > 30 && calculation <= 50) ? 1
                      : 0.5
            )


            // console.warn("weight", calculatedWeight);
            this.http.get("https://developers.onemap.sg/commonapi/convert/3414to4326?X=" + element.x_coord + "&Y=" + element.y_coord).subscribe(convertedWSG84 => {
              // console.log(convertedWSG84);
              let newMarker = new google.maps.LatLng(convertedWSG84["latitude"], convertedWSG84["longitude"]);

              // calculatedWeight == 60 ? array1.push({ location: newMarker, weight: calculatedWeight }) :
              //   calculatedWeight == 2 ? array2.push({ location: newMarker, weight: calculatedWeight }) :
              //     calculatedWeight == 1.5 ? array3.push({ location: newMarker, weight: calculatedWeight }) : array4.push({ location: newMarker, weight: calculatedWeight })

              allData.push({ location: newMarker, weight: calculatedWeight });

              if (calculatedWeight == 60) {
                array1.push({ location: newMarker, weight: calculatedWeight });
                this.createMarker(convertedWSG84["latitude"], convertedWSG84["longitude"], "http://maps.google.com/mapfiles/ms/icons/red-dot.png", thisCar.carpark_info[0]["lots_available"]);
              }
              else if (calculatedWeight == 2) {
                array2.push({ location: newMarker, weight: calculatedWeight });
                this.createMarker(convertedWSG84["latitude"], convertedWSG84["longitude"], "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", thisCar.carpark_info[0]["lots_available"]);
              }
              else if (calculatedWeight == 1.5) {
                array3.push({ location: newMarker, weight: calculatedWeight });
                this.createMarker(convertedWSG84["latitude"], convertedWSG84["longitude"], "http://maps.google.com/mapfiles/ms/icons/green-dot.png", thisCar.carpark_info[0]["lots_available"]);
              }
              else {
                array4.push({ location: newMarker, weight: calculatedWeight });
                this.createMarker(convertedWSG84["latitude"], convertedWSG84["longitude"], "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", thisCar.carpark_info[0]["lots_available"]);
              }


            });
          }


        })

        var singapore = new google.maps.LatLng(1.3633449, 103.85641989999999);

        this.map = new google.maps.Map(document.getElementById('mapID'), {
          center: singapore,
          zoom: 10,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          zoomControl: true
        });

        let legend = this.createLegend();
        this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

        this.heatmap1 = new google.maps.visualization.HeatmapLayer({
          data: array1,
          radius: 24,
          opacity: 0.8,
          map: this.map,
        })
        this.heatmap2 = new google.maps.visualization.HeatmapLayer({
          data: array2,
          radius: 24,
          opacity: 0.8,
          map: this.map,
        })
        this.heatmap3 = new google.maps.visualization.HeatmapLayer({
          data: array3,
          radius: 24,
          opacity: 0.8,
          map: this.map,
        })
        this.heatmap4 = new google.maps.visualization.HeatmapLayer({
          data: array4,
          radius: 24,
          opacity: 0.8,
          map: this.map,
        });

        // var heatMapDynamic = new google.maps.visualization.HeatmapLayer({
        //   data: allData,
        //   radius: 24,
        //   opacity: 0.8
        // });

        // heatMapDynamic.setMap(this.map)

        // heatmap1.set('gradient', heatmap1.get('gradient') ? null : red);
        // heatmap2.set('gradient', heatmap2.get('gradient') ? null : yellow);
        // heatmap3.set('gradient', heatmap3.get('gradient') ? null : green);
        // heatmap4.set('gradient', heatmap4.get('gradient') ? null : blue);
        this.heatmap1.set('gradient', gradients.red);
        this.heatmap2.set('gradient', gradients.yellow);
        this.heatmap3.set('gradient', gradients.green);
        this.heatmap4.set('gradient', gradients.blue);
        // heatmap.setMap(this.map);

        // var gradient = [
        //   'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 0)',
        //   'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 1)'
        // ];



        this.map.addListener('zoom_changed', () => {
          console.error("zoomedd!!", this.map)
          if (this.map.getZoom() > 13) {
            // console.warn("zoomed mor ethan 13 ", heatmap1);
            // this.heatmap1.setMap(null)
            // this.heatmap2.setMap(null)
            // this.heatmap3.setMap(null)
            // this.heatmap4.setMap(null)
            this.setHeatMap(null);
            this.showMarkers(true);
            this.selectedMarker && this.calculateMarkers(this.selectedMarker.position);
          }
          else {
            console.warn("not zoomed");
            this.setHeatMap(this.map);
            this.showMarkers(false);
          }
        })
      });

      console.warn("load finish");

    });

  }

  setHeatMap(visible) {
    this.heatmap1.setMap(visible);
    this.heatmap2.setMap(visible);
    this.heatmap3.setMap(visible);
    this.heatmap4.setMap(visible);
  }

  showMarkers(visible) {
    this.globalMarker.forEach(thisMarker => {
      thisMarker.setVisible(visible);
    });
  }

  currentInfoWindow = new google.maps.InfoWindow();

  createMarker(latitude, longitude, icon, noOfLotsAvailable) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: this.map,
      visible: false,
      icon: icon
    });
    this.globalMarker.push(marker);
    let content = `<h4> No of lots available: ${noOfLotsAvailable} </h4>`;
    this.createInfoWindow(marker, content);
  }

  createInfoWindow(marker, content) {
    google.maps.event.addListener(marker, 'click', () => {
      this.currentInfoWindow.setContent(content);
      this.currentInfoWindow.open(this.map, marker);
    })
  }

  updateSearchResults() {
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    console.warn("search input", this.autocomplete);
    this.googleAutoComplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        console.error("predictions", predictions);
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  // When autocomplete item is selected
  selectSearchResult(item) {
    this.selectedMarker && this.selectedMarker.setMap(null)
    this.currentCircle && this.currentCircle.setMap(null);
    this.autocompleteItems = [];
    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        let marker = new google.maps.Marker({
          animation: google.maps.Animation.BOUNCE,
          position: results[0].geometry.location,
          map: this.map,
        });
        this.selectedMarker = marker;
        this.map.setZoom(14);
        this.map.panTo(marker.position);
        console.warn("marker", marker.position);
        this.createCircle(marker.position);
        this.calculateMarkers(marker.position, true);
      }
    });
  }

  radiusRange = 0;
  currentCircle;

  createCircle(position) {
    this.radiusRange = 1000;
    let newCircle = new google.maps.Circle({
      center: position,
      map: this.map,
      strokeColor: '#000',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: '#808080',
      fillOpacity: 0.35,
      radius: this.radiusRange
    })
    this.currentCircle = newCircle;
  }

  radiusRangeChange() {
    console.warn(this.radiusRange);
    this.currentCircle.setRadius(this.radiusRange);
    this.map.fitBounds(this.currentCircle.getBounds());
    this.calculateMarkers(this.selectedMarker.position);
  }

  calculateMarkers(searchedPosition, showMarkerIfNotShown?) {
    this.globalMarker.forEach(thisMarker => {
      if (showMarkerIfNotShown) {
        thisMarker.setVisible(true)
      }
      let distance = google.maps.geometry.spherical.computeDistanceBetween(thisMarker.getPosition(), searchedPosition);
      if (distance > this.radiusRange) {
        thisMarker.setVisible(false);
      }
    });
  }


  createLegend() {
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 
    `<p> <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"> Little space </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"> Moderate space </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"> Lots of space </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"> Full </p>
    `;
    // controlDiv.appendChild(controlText);
    return controlText;
  }

}