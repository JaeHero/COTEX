// src/app/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetamaskService } from '../services/metamask.service';
import { ethers } from 'ethers';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  address?: string;
  private signerSub?: Subscription;

  constructor(private mm: MetamaskService) {}

  ngOnInit(): void {
    // Subscribe to all signer changes, incl. rehydrates and account switches
    this.signerSub = this.mm.getSigner().subscribe(async (s) => {
      if (s) {
        this.address = await s.getAddress();
        console.log('Updated address:', this.address);
      } else {
        this.address = undefined;
        console.log('Signer disconnected');
      }
    });
  }

  ngOnDestroy(): void {
    this.signerSub?.unsubscribe();
  }

  async onConnect(): Promise<void> {
    try {
      await this.mm.connectToMetaMaskWallet();
    } catch (err) {
      console.error('MetaMask connect error', err);
    }
  }
}
