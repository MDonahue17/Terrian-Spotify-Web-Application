import { Component, OnInit, AfterViewInit, AfterContentInit, AfterViewChecked } from '@angular/core';
import { Authorization } from './login/Authorization.service';
import SpotifyWebApi from 'spotify-web-api-js';
import * as Q from 'q';

/*App component interacts with the footer and navbar for the website as those 
stay constant throughout the webpage */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {  
  
  accessToken = "";
  title = 'Terrian';
  navbarOpen : boolean = false;
  s;
  user = "";

  /*This sets the "active" state in the HTML navbar depending on which page we are currently on*/
  pageActive = {
    welcomeActive: false,
    rankingsActive: false
  }

  currentPlaying = {
    song: "",
    name: "",
    artists: "",
    valued: false,
    time: null
  }

  /*Inject Authorization DI*/
  constructor(private auth:Authorization) { }

  ngOnInit(): void {
    this.checkActive();
  }
  
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  /*After we load the other component (welcome, rankings or song)
    We grab the auth token from the Authorization class and access the data needed*/ 
  async ngAfterViewChecked() {
    if(!this.accessToken && this.auth.accessToken) {
      this.accessToken = this.auth.accessToken;
      this.s = new SpotifyWebApi();
      this.s.setAccessToken(this.accessToken);
      this.s.setPromiseImplementation(Q);
      let user = await this.s.getMe();
      this.user = user.display_name;
    }
  }

 

  //Changes the current "active" page in the navbar 
  checkActive() {
    let url = window.location.href;
    if (url.search("rankings") != -1) {
      this.turnToFalse();
      this.pageActive.rankingsActive = true;
    } else {
      this.turnToFalse();
      this.pageActive.welcomeActive = true;
    }

  }

  private turnToFalse() {
    this.pageActive.welcomeActive = false;
    this.pageActive.rankingsActive = false;
  }
   
}

