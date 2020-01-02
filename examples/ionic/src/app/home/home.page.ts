import { Component, OnInit } from '@angular/core';
import { GooglePlayGamesServices } from '@ionic-native/google-play-games-services/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public isSignedIn = false;

  constructor(private googlePlayGamesServices: GooglePlayGamesServices) {}

  public ngOnInit() {
    this.googlePlayGamesServices.isSignedIn()
      .then((response) => this.isSignedIn = response.isSignedIn);
  }

  public signIn() {
    this.googlePlayGamesServices.auth()
      .then(() => {
        this.isSignedIn = true;
      });
  }

  public signOut() {
    this.googlePlayGamesServices.signOut()
      .then(() => this.isSignedIn = false);
  }
}
