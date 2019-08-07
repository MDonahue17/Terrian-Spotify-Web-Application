import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Authorization } from '../login/Authorization.service';
import SpotifyWebApi from 'spotify-web-api-js';
import {Router} from '@angular/router';

/*
The song page displays the current playing song, the artists' photos and 
gives the user the ability to skip song, go to previous, play/pause, 
favorite the track, and set shuffle to true of false. 
*/

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})

export class SongComponent implements OnInit {
  songId:string; 
  song;
  artists:Array<any> = new Array<any>();
  accessToken: string;
  s;
  cur_artist = 0;
  playing = true;
  artistsName: string = "";
  shuffle: boolean = false;
  favorited: boolean = false;


  constructor(private auth: Authorization, private route: ActivatedRoute, private router: Router) { }

  /*On Init, we grab the id from the url and set the song accordingly. */
  async ngOnInit() {
    this.songId = this.route.snapshot.paramMap.get('id');
    this.accessToken = this.auth.accessToken;
    this.s = new SpotifyWebApi();
    this.s.setAccessToken(this.accessToken);
    this.song = await this.s.getTrack(this.songId); //Fetches track
    
    //Sets artists name
    if(this.song) { 
      for (let i = 0; i < this.song.artists.length; i++) {
        this.artists[i] = await this.s.getArtist(this.song.artists[i].id)
        if (i + 1 == this.song.artists.length && i !== 0) {
          this.artistsName += " & " + this.artists[i].name;
        } else if (i != 0) {
          this.artistsName += ", " + this.artists[i].name;
        } else {
          this.artistsName = this.artists[i].name;
        }
      }
    }
    this.setLengths(); //Sets the length of the track name and artists' name
    this.setScreen(); 

    //Gets the current track and the playback state
    let cur = await this.s.getMyCurrentPlayingTrack();
    let info = await this.s.getMyCurrentPlaybackState();
    this.shuffle = info.shuffle_state;
    if(this.shuffle) {
      let elm = document.getElementById("shuffleButton");
      elm.style.color = "#62c467";
    }

    let fav = await this.s.containsMySavedTracks([this.song.id]);
    this.favorited = fav[0];

    if(this.favorited) {
      let elm = document.getElementById("favoriteButton");
      elm.style.color = "#62c467";
    }
    
    
    this.playing = cur.is_playing;
    if (this.playing) {
      document.getElementById('play').style.display = 'none';
      document.getElementById('pause').style.display = 'block';
    } else {
      document.getElementById('play').style.display = 'block';
      document.getElementById('pause').style.display = 'none';
    }

    //Sets length of current song
    let time = cur.item.duration_ms - cur.progress_ms;

    if(time > 60000) time = 60000;

    //Calls maintainScreen to keep display up to date
    setTimeout(this.maintainScreen.bind(this), time);
  }

  /* Sets the display of the HTML on the song page*/
  setScreen() {
    let backImg = document.getElementById('backgroundId') as HTMLImageElement;
    backImg.src = this.artists[0].images[0].url;
    backImg.style.height += "99.9%";
    backImg.style.opacity += '.6';
    backImg.style.filter += 'alpha(opacity=70)';
    backImg.style.width += "100%";
    backImg.style.objectFit += "cover";

    let elm = document.getElementById('albumDisplay');
    let value = (window.innerHeight/2) - 275;
    elm.style.paddingTop = value.toString() + 'px';


  }

  /* Maintains the current song displayed is also the current song playing */ 
  async maintainScreen() {
    let cur = await this.s.getMyCurrentPlayingTrack();
    let other = await this.s.getTrack(cur.item.id);

    if (other !== this.song) {
      this.router.navigate(['../../song', other.id], { relativeTo: this.route });
      this.song = other;
      this.setLengths();
      this.artists = new Array();
      for (let i = 0; i < this.song.artists.length; i++) {
        this.artists[i] = await this.s.getArtist(this.song.artists[i].id)
        if (i + 1 == this.song.artists.length && i !== 0) {
          this.artistsName += "& " + this.artists[i].name;
        } else if (this.song.artists.length > 1) {
          this.artistsName += ", " + this.artists[i].name;
        } else {
          this.artistsName = this.artists[i].name;
        }
      }
      this.setLengths();
      this.cur_artist = 0;
    }
    let time = cur.item.duration_ms - cur.progress_ms;
    
    if (time > 60000) time = 60000;

    this.setImage();
    setTimeout(this.maintainScreen.bind(this), time);
    
  }

  /*Sets the background image, if the song has played for a minute and there are
  Multiple artists playing, it will change to another one of the artists */
  setImage() {
    
    let backImg = document.getElementById('backgroundId') as HTMLImageElement;
    
    if (this.cur_artist++ > this.artists.length) this.cur_artist = 0;
    this.cur_artist = 420 % this.artists.length;

    backImg.src = this.artists[this.cur_artist].images[0].url;

  }

  /*
    Will change the state of the current playing song to pause or play and shows the proper button
  */
  playPause() {
    this.playing = !this.playing
    if (this.playing) {
      this.s.play();
      document.getElementById('play').style.display = 'none';
      document.getElementById('pause').style.display = 'block';
    } else {
      this.s.pause();
      document.getElementById('play').style.display = 'block';
      document.getElementById('pause').style.display = 'none';
    }
  }

  //Skips to next song
  async skipNext() {
    await this.s.skipToNext();
    this.maintainScreen();
  }

  //Goes back a song
  async skipBack() {
    await this.s.skipToPrevious();
    this.maintainScreen();
  }

  //Changes state of the shuffle
  shuffleTracks() {
    this.s.setShuffle(!this.shuffle)
    if(this.shuffle){
      let elm = document.getElementById("shuffleButton");
      elm.style.color = "lightgray";
    } else {
      let elm = document.getElementById("shuffleButton");
      elm.style.color = "#62c467";
    }
    this.shuffle = !this.shuffle;
  }

  //Adds the track to your saved library and updates Spotify
  favorite() {
    if(this.favorited){
      this.s.removeFromMySavedTracks([this.song.id]);
      let elm = document.getElementById("favoriteButton");
      elm.style.color = "lightgray";
    } else {
      this.s.addToMySavedTracks([this.song.id]);
      let elm = document.getElementById("favoriteButton");
      elm.style.color = "#62c467";
    }
    this.favorited = !this.favorited;

  }

  //Changes the artists' name length and song name length
  private setLengths() {
    if(this.song.name.length > 26) {
      this.song.name = this.song.name.substr(0, 23) + "...";
    }
    if(this.artistsName.length > 34) {
      this.artistsName = this.artistsName.substr(0, 31) + "...";
    }
  }


}
