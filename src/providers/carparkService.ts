import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ToastController } from 'ionic-angular';



@Injectable()
export class MyService {

    darkMode: boolean;

    constructor(private http: HttpClient, private toastController: ToastController) { }

    getCarParks() {
        return new Promise(resolve => {
            this.http.get("https://api.data.gov.sg/v1/transport/carpark-availability").subscribe(res => {
                let json = res["items"][0]["carpark_data"];
                console.warn("json resolve carpark availability", json);
                resolve(json);
            })
        })
    }

    async presentToast(message) {
        let toast = await this.toastController.create({
            message: message,
            duration: 2000,
            showCloseButton: true,
            // dismissOnPageChange: true
        });
        toast.present();
    }
    
}