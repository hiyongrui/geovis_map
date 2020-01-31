import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, Platform, Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyService } from '../../providers/carparkService';


declare var google;
declare var MarkerClusterer;
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
  heatmapRed;
  heatmapYellow;
  heatmapGreen;
  heatmapBlue;

  darkMode: boolean;

  markerCluster;

  constructor(public navCtrl: NavController, public platform: Platform, public http: HttpClient, public service: MyService, public zone: NgZone, public event: Events) {
    this.event.subscribe("darkMode", darkMode => {
      console.warn('toggled triggered', darkMode);
      this.darkMode = darkMode;
      darkMode ? this.map.setOptions({ styles: this.mapStyle }) : this.map.setOptions({ styles: [] });
      if (document.getElementById("legendDivID")) document.getElementById("legendDivID").style.color = darkMode ? 'rgb(255,255,255)' : 'rgb(25,25,25)';
    })
  }

  ngOnInit() {
    this.loadData();
  }

  globalMarker = [];

  loadData() {

    this.service.getCarParks().then((allCarJSON: Car[]) => {

      let allCarJSONFilteredToday = allCarJSON.filter(x => x.update_datetime >= new Date().toISOString());

      this.getCarParkData(allCarJSONFilteredToday).then(data => {

        this.convertCarParkCoordinates_loadMap(data);

      });
    })

  }

  getCarParkData(allCarJSONFilteredToday) {
    return new Promise(resolve => {
      this.http.get("https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=500").subscribe(data => {
        let promises = [];
        data["result"]["records"].forEach(element => {
          let thisCarFound = allCarJSONFilteredToday.find(x => x["carpark_number"] === element["car_park_no"]);
          if (thisCarFound) {
            // console.warn("this car found", element)
            promises.push({ ...thisCarFound, x: element.x_coord, y: element.y_coord });
          }
        }) //end of whole for loop
        resolve(promises);
      })
    })
  }

  convertCarParkCoordinates_loadMap(data) {

    let gradients = {
      red: [
        'rgba(255, 0, 0, 0)',
        'rgba(255, 0, 0, 1)'
      ],
      yellow: [
        'rgba(255, 255, 0, 0)',
        'rgba(255, 255, 0, 1)'
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

    var arrayRed = [];
    var arrayYellow = [];
    var arrayGreen = [];
    var arrayBlue = [];

    let promisesOfCoordinates = [];
    data.forEach(element => {
      promisesOfCoordinates.push(this.resolveHttpConvertCoordinates(element));
    });

    Promise.all(promisesOfCoordinates).then(coordinates => {
      // console.error("vals", coordinates);
      coordinates.forEach((coordinate, index) => {
        let thisCar = data[index];
        thisCar.latitude = coordinate["latitude"];
        thisCar.longitude = coordinate["longitude"];
      });

      data.forEach(thisCar => {

        let lotsAvailable = thisCar["carpark_info"][0]["lots_available"];
        let newMarker = new google.maps.LatLng(thisCar["latitude"], thisCar["longitude"]);

        if (lotsAvailable > 200) {
          arrayRed.push({ location: newMarker, weight: 30 });
          this.createMarker(thisCar.latitude, thisCar.longitude, "http://maps.google.com/mapfiles/ms/icons/red-dot.png", lotsAvailable);
        }
        else if (lotsAvailable > 50 && lotsAvailable <= 200) {
          arrayYellow.push({ location: newMarker, weight: 20 });
          this.createMarker(thisCar["latitude"], thisCar["longitude"], "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", lotsAvailable);
        }
        else if (lotsAvailable > 0 && lotsAvailable <= 50) {
          arrayGreen.push({ location: newMarker, weight: 1.5 });
          this.createMarker(thisCar["latitude"], thisCar["longitude"], "http://maps.google.com/mapfiles/ms/icons/green-dot.png", lotsAvailable);
        }
        else if (lotsAvailable == 0) {
          arrayBlue.push({ location: newMarker, weight: 1 });
          this.createMarker(thisCar["latitude"], thisCar["longitude"], "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", lotsAvailable);
        }

      }); //end of for loop


      let mcOptions = {maxZoom: 14, styles: [{
          height: 66,
          url: "assets/imgs/m3.png",
          width: 66
        },
        {
          height: 53,
          url: "assets/imgs/m1.png",
          width: 53
        }]
      }
      this.markerCluster = new MarkerClusterer(this.map, this.globalMarker, mcOptions);
      this.markerCluster.setCalculator(function (markers, numStyles) {
        for (var i = 0; i < markers.length; i++) {
          let index = (markers[i].getIcon().indexOf("red") > -1 || markers[i].getIcon().indexOf("yellow") > -1) ? 2 : 1
          return {text: Math.floor(markers.length/2), index: index}
        }
      })
      // { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', maxZoom: 15 });

      // this.markerCluster.setMap(null);
      
    }); //end of promise

    let singapore = new google.maps.LatLng(1.3633449, 103.85641989999999);

    this.map = new google.maps.Map(document.getElementById('mapID'), {
      center: singapore,
      zoom: 10,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      styles: this.service.darkMode && this.mapStyle
    });

    let legend = this.createLegend();
    this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    this.heatmapRed = new google.maps.visualization.HeatmapLayer({
      data: arrayRed,
      radius: 24,
      opacity: 0.8,
      map: this.map,
      gradient: gradients.red
    })
    this.heatmapYellow = new google.maps.visualization.HeatmapLayer({
      data: arrayYellow,
      radius: 24,
      opacity: 0.8,
      map: this.map,
      gradient: gradients.yellow
    })
    this.heatmapGreen = new google.maps.visualization.HeatmapLayer({
      data: arrayGreen,
      radius: 24,
      opacity: 0.8,
      map: this.map,
      gradient: gradients.green
    })
    this.heatmapBlue = new google.maps.visualization.HeatmapLayer({
      data: arrayBlue,
      radius: 24,
      opacity: 0.8,
      map: this.map,
      gradient: gradients.blue
    });

    // this.heatmapRed.set('gradient', gradients.red);
    // this.heatmapYellow.set('gradient', gradients.yellow);
    // this.heatmapGreen.set('gradient', gradients.green);
    // this.heatmapBlue.set('gradient', gradients.blue);

    this.map.addListener('zoom_changed', () => {
      // console.warn("zoomed", this.map.getZoom())
      if (this.map.getZoom() > 13) {
        this.setHeatMap(null);
        this.showMarkers(true);
        this.selectedMarker && this.calculateMarkers(this.selectedMarker.position);
      }
      else {
        this.setHeatMap(this.map);
        this.showMarkers(false);
        this.currentInfoWindow.close();
      }
    })

    console.error('returning carparkcoordinates data', data);

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      console.warn("idle");
      setTimeout(() => {
        this.map.setZoom(this.map.getZoom()); //technique to overcome heatmap layer not shown when navigating to the page again till user zoom in/out
      }, 1000);
    });

  }

  resolveHttpConvertCoordinates(element) {
    return new Promise(resolve => {
      this.http.get("https://developers.onemap.sg/commonapi/convert/3414to4326?X=" + element.x + "&Y=" + element.y).subscribe(convertedWSG84 => {
        resolve(convertedWSG84);
      })
    })
  }

  setHeatMap(visible) {
    this.heatmapRed.setMap(visible);
    this.heatmapYellow.setMap(visible);
    this.heatmapGreen.setMap(visible);
    this.heatmapBlue.setMap(visible);
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
        this.map.setZoom(13);
        this.map.panTo(marker.position);
        console.warn("marker selected search", marker.position);
        this.createCircle(marker.position);
        this.calculateMarkers(marker.position, true);
        this.currentInfoWindow.close();
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
    let carParkCount = 0;
    this.globalMarker.forEach(thisMarker => {
      showMarkerIfNotShown && thisMarker.setVisible(true);
      let distance = google.maps.geometry.spherical.computeDistanceBetween(thisMarker.getPosition(), searchedPosition);
      distance > this.radiusRange ? thisMarker.setVisible(false) : carParkCount++;
    });
    carParkCount == 0 && this.service.presentToast("No carparks found within buffer radius!")
  }


  createLegend() {
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.id = "legendDivID"
    controlText.style.color = this.service.darkMode ? 'rgb(255,255,255)' : 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML =
      `<p> <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"> Lots of space </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"> Moderate space  </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"> Little space </p>
    <p> <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"> Full </p>
    `;
    return controlText;
  }

  mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#263c3f"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#6b9a76"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#38414e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#212a37"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9ca5b3"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#1f2835"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#f3d19c"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#2f3948"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#515c6d"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    }
  ]


}