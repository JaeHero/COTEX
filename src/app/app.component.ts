import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaMaskSDK } from '@metamask/sdk';
import { MetamaskService } from './services/metamask.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Cotex';
  account: string | null = null;

  constructor(private mm: MetamaskService) {}

  ngOnInit() {
    this.mm.account$.subscribe((acc) => {
      this.account = acc;
      if (!acc) {
        console.warn('MetaMask disconnected or locked');
      }
    });
  }

  onConnect() {
    this.mm.connect().catch((err) => console.error(err));
  }
}
