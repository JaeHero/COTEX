import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Revenue } from '../models/revenue';

@Injectable({
  providedIn: 'root',
})
export class YoutubeDataService {
  constructor(private httpClient: HttpClient) {}

  getRevenueData(): Observable<Revenue> {
    return this.httpClient.get<Revenue>(
      'https://284ed5a9-91b6-446c-ad81-839ce3753418.mock.pstmn.io/revenue'
    );
  }
}
