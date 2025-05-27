import { Component } from '@angular/core';
import { YoutubeDataService } from '../services/youtube-data.service';
import { MetamaskService } from '../services/metamask.service';
import { Revenue } from '../models/revenue';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(
    private mm: MetamaskService,
    private youtubeService: YoutubeDataService
  ) {}
  account: string | null = null;
}
