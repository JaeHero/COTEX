import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaMaskSDK } from '@metamask/sdk';
import { MetamaskService } from './services/metamask.service';
import { YoutubeDataService } from './services/youtube-data.service';
import { Revenue } from './models/revenue';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'COTEX';
  constructor() {}
}
