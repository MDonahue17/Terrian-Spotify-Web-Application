import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as express from 'express';
import { request } from 'request';
import * as qs from 'query-string';

/* An Injectable used to pass data from one component to the next currerntly */

/* TODO - Move all authorization here */

interface firstGet {
    code;
    state;
    error;
}

@Injectable({
    providedIn: 'root'
})
export class Authorization {
    singleton = 1;
    token = null;
    accessToken: string = "";
    song = null;
    
    constructor(private http:HttpClient) {} 
    test() {
        console.log("injected" + ++this.singleton);
    }

    authorization(url:string) {
        location.href='http://localhost:8888/login';
        this.accessToken = this.acquireToken();

    }

    private acquireToken() : string {
        let url = window.location.href;
        let other = url.substring(url.indexOf("=") + 1);
        
        if (other.length == url.length) {
          return "";
        }
        
        return other;
    }

}

