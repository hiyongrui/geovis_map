import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';



@Injectable()
export class MyService {

    constructor(private http: HttpClient) { }

    getCarParks() {
        return new Promise(resolve => {
            this.http.get("https://api.data.gov.sg/v1/transport/carpark-availability").subscribe(res => {
                let json = res["items"][0]["carpark_data"];
                console.warn("json resolve", json);
                resolve(json);
            })
        })
    }
}