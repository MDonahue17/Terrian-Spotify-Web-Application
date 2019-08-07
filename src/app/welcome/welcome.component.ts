import { Component, OnInit, AfterViewChecked } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import * as Q from 'q';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Authorization } from '../login/Authorization.service';
import { Router } from '@angular/router';
import { element } from 'protractor';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  s: any;
  accessToken : string;
  playlists : Array<any>;
  playlistNames : Array<string>;
  safe: SafeHtml;
  currentPlaying = {
    song: "",
    name: "",
    artists: "",
    artistUrl: "",
    url: "",
    valued: false,
    time: null
  }

  constructor(private sanitizer: DomSanitizer, private auth:Authorization, private router: Router) { }

  /*On Init, we create new access to the SpotifyWebApi. 
    we check if there is a current accessToken and set that token to have permission
    If we do not have a token a 401 error will be thrown which will be caught later
    on in the code.
    After this, we set up the SpotifyWebApi we access token and PromiseImplementation.
    If we do not currently have playlists from the user saved, we fetch them. 
    Finally, if there is a Song playing, we set the song playing feature accordingly*/
  async ngOnInit() {
    this.s = new SpotifyWebApi();
    this.accessToken = this.auth.accessToken;
    let possible_current = this.acquireToken();
    if(possible_current.length != 0) {
      this.accessToken = possible_current;
    }
    await this.s.setAccessToken(this.accessToken);
    this.auth.accessToken = this.accessToken;
    this.s.setPromiseImplementation(Q);
    
    if(!this.playlists) {
      await this.gatherPlaylists();
      console.log(this.playlists);
    }
    this.setSong();
  }

  //Acquires Token from the url if one exists
  acquireToken() : string {
    let url = window.location.href;
    let other = url.substring(url.indexOf("=") + 1);
    if (other.length == url.length) {
      return "";
    }
    return other;
  }

  /* 
    If there is a song currently playing through Spotify, the setSong method is called and 
    displays the song on the Welcome Screen.
  */
  async setSong() {
      let song = await this.s.getMyCurrentPlayingTrack(); //Fetches current playing track
      this.currentPlaying.song = song;
      if(!song){
        return; //If null, no other processing is made as we cannot display a song not playing
      }

      this.currentPlaying.name = song.item.name; 

      //If the song name is too long, we shorten it to fit on one line
      if (this.currentPlaying.name.length > 32) {
        this.currentPlaying.name = this.currentPlaying.name.substring(0, 29) + ". . .";
      }
      this.currentPlaying.artists = song.item.artists[0].name;

      let elm = document.getElementById('curPlayingDiv')

      //If there are multiple artists in a song, we format our artist display
      for(let i = 1; i < song.item.artists.length; i++) {
        if(i + 1 == song.item.artists.length) this.currentPlaying.artists += " & " + song.item.artists[i].name;
        else this.currentPlaying.artists += ", " + song.item.artists[i].name;
      }

      this.currentPlaying.valued = true;
      //Set the image of the album cover of the current playing track
      this.currentPlaying.url = song.item.album.images[0].url;

      //Set the length of time left in the song
      let time = song.item.duration_ms - song.progress_ms;
      this.currentPlaying.time = time;
      this.auth.song = this.currentPlaying; 
      //Reperforms the method after the song is done playing
      setTimeout(this.setSong.bind(this), time);
  }

  /*
  Here we gather the info needed to dispaly the users playlists
  */
  async gatherPlaylists() {
    try {
      let value = await this.s.getUserPlaylists({ limit: 6 });
      console.log(value);
      let toAdd = new Array();

      //Fetches the playlists
      for (let i = 0; i < value.items.length; i++) {
        let newPlaylist = await this.s.getPlaylist(value.items[i].id);
        toAdd.push(newPlaylist);
      }
      this.playlists = toAdd;

      //Edits the names if they are too long
      for(let i = 0; i < this.playlists.length; i++) {
        if(this.playlists[i].name.length > 26) {
          this.playlists[i].name = this.playlists[i].name.substring(0, 23) + "..."
        }
      }
    } catch (error) { 
      if(error.status == 401) { //The access token we never given or expired
        console.log("401");
        location.href='http://localhost:8888/login';
      }
      console.log(error);
    }

  }

  /* openContent is our animation for the playlists. On click we display the description
  (if one exists) and the top 5 tracks for the playlist
  */
  openContent(value) {
    var button = document.getElementById("playlist-button" + value);
    var content = document.getElementById("content-playlist" + value);
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      setTimeout(function() {
        button.style.height = "100px";
      }, 200); 
      
    } else {
      var newHeight = content.scrollHeight + 120;
      setTimeout(function() {
        content.style.maxHeight = content.scrollHeight + "px";
      }, 200);
      button.style.height = newHeight + "px";
    } 
  }

}
