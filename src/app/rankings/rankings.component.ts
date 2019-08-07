import { Component, OnInit } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import * as Q from 'q';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Authorization } from '../login/Authorization.service';

/* The rankings page showcases the users most listened to artists and tracks
  over three time periods (4 weeks, 6 months, all time). As well, users can 
  create playlists that will be reflected in their Spotify account based off the 
  data.
*/

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  authorization: boolean;
  title: string;
  accessToken : string = "";
  s: any;
  artists : string;
  safe: SafeHtml;
  tracks;
  closeResult : string;
  name : string = "hello";
  artistValue : string = null;
  trackValue : string = null;

  createPlaylistInput = {
    name: 'Personal Playlist',
    desc: null
  }

  constructor(private sanitizer: DomSanitizer, private modalService: NgbModal, 
    private auth:Authorization) { }

  /* On Init, we set up the SpotifyWebApi class */
  async ngOnInit() {
    this.authorization = true;
    this.s = new SpotifyWebApi();
    this.accessToken = this.auth.accessToken;
    let possible_current = this.acquireToken();
    if(possible_current.length != 0) {
      this.accessToken = possible_current;
    }
    await this.s.setAccessToken(this.accessToken);
    this.s.setPromiseImplementation(Q);
    this.title = "Rankings";
    this.artists = "";
  }

  acquireToken() : string {
    let url = window.location.href;
    let other = url.substring(url.indexOf("=") + 1);
    if (other.length == url.length) {
      return "";
    }
    return other;
  }

  /* Here we open the window which acts as a form to create our playlists */
  async open(content) {
    await this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    console.log(this.name);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  /* We fetch the data for artists rankings and build the card in HTML to be injected 
    into the HTML page.
  */
  async artistButton() {
    try {

      let value = await this.s.getMyTopArtists({limit:50, time_range: this.artistValue});
      console.log(value);
      let a : string = "";
      for (let i = 0; i < value.items.length; i++) {
        if(value.items[i].images[0]) {
          a += this.buildArtistCard(value.items[i].images[0].url, value.items[i].name, i + 1);
        } else {
          a += this.buildArtistCard(value.items[0].images[0].url, value.items[i].name, i + 1);
        }
      }
      this.safe = this.sanitizer.bypassSecurityTrustHtml(a);
      this.tracks = null;
    } catch (error) {
      if(error.status == 401) {
        console.log("401");
        location.href='http://localhost:8888/rankings-auth';
      }
      console.log(error);     
    }
    
  }

  //The HTML to display Artist card 
  private buildArtistCard(url: string, name: string, rank) {
    let toAdd = "";
    toAdd += "<div id=\"cardsID\" class=\"card\">" +
        "<img class=\"card-img-top\" src=\"" + url + "\" alt=\"Card image cap\">" +
        "<h5 class=\"card-title\">" + name + "</h5>" +
        "<h6 class=\"card-subtitle mb-2 text-muted\">#" + rank + "</h6>" +
      "</div>";
    return toAdd;
  }

  /*Same as the Artists method except with tracks*/
  async tracksButton() {
    try {
      let value = await this.s.getMyTopTracks({limit:50, time_range: this.trackValue});
      let a : string = "";
      for(let i = 0; i < value.items.length; i++) {
        a += this.buildTrackCard(value.items[i].album.images[0].url, value.items[i].name,
          value.items[i].artists, i + 1);
        }
      this.safe = this.sanitizer.bypassSecurityTrustHtml(a);
      this.tracks = value;
    } catch(error) {
      console.log(error);
      /* location.href='http://localhost:8888/login';
      this.accessToken = this.acquireToken();
      this.tracksButton(); */
    }
  }

  private buildTrackCard(url: string, name: string, artists, rank) {
    let toAdd = "";
    let space = "";
    let newName = name;
    let artist = artists[0].name;

    if(newName.length > 20) {
      newName = newName.substring(0,17) + "..."
    }

    if (artists[1]) {
      artist += "& " + artists[1].name;
    }

    if (artist.length > 24) {
      artist = artist.substring(0,21) + "..."
    }

    toAdd += 
      "<div id=\"cardsID\" class=\"card\">" +
        "<div class=\"container\">" + 
          "<img class=\"card-img-top\" src=\"" + url + "\" alt=\"Card image cap\">" +
        "</div>" +
        "<h5 class=\"card-title\">" + newName + "</h5>" +
        "<h6 class=\"card-subtitle mb-2 text-muted\">" + 
          "<div id=\"left-name\">" +
            artists[0].name + 
          "</div>" + 
          "<div id=\"right-name\">" + 
            "#" + rank + 
          "</div>" + 
        "</h6>" +
      "</div>";
    return toAdd;
  }

  // The method to use the data from Rankings to make a playlist and update the user's Spotify account
  async createPlaylistOfTopData() {
    let value = await this.s.getMe();
    let playlist = await this.s.createPlaylist(value.id, {
      name: this.createPlaylistInput.name,
      description: this.createPlaylistInput.desc
    });
    let id = playlist.id;
    let uris = new Array();
    for (let i = 0; i < this.tracks.items.length; i++) {
      uris.push(this.tracks.items[i].uri);
    }
    this.s.addTracksToPlaylist(id, uris);
  }

}


 