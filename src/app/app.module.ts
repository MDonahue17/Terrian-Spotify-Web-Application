import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { RankingsComponent } from './rankings/rankings.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';
import {HttpClientModule} from '@angular/common/http';
import { SongComponent } from './song/song.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';



@NgModule({
  declarations: [
    AppComponent,
    RankingsComponent,
    WelcomeComponent,
    LoginComponent,
    SongComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    HttpModule,
    AngularFontAwesomeModule,
    RouterModule.forRoot([
      { path: 'rankings', component: RankingsComponent},
      { path: 'welcome', component: WelcomeComponent},
      { path: 'login', component: LoginComponent},
      { path: 'song/:id', component: SongComponent},
      { path: '**', redirectTo: 'welcome', pathMatch: 'full'}
    ], { useHash: true })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
