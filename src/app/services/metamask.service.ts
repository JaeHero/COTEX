// src/app/services/metamask.service.ts
import { Injectable, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class MetamaskService {
  private provider?: ethers.BrowserProvider;
  private signerSubject = new BehaviorSubject<ethers.Signer | undefined>(
    undefined
  );

  constructor(private ngZone: NgZone) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      // Rehydrate existing session without popup
      this.provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          this.provider
            ?.getSigner()
            .then((signer) => this.signerSubject.next(signer));
        }
      });
      // Detect account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.ngZone.run(() => {
          if (accounts.length === 0) {
            this.handleMetaMaskDisconnect();
          } else {
            this.handleMetaMaskAccountsChanged(accounts);
          }
        });
      });
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  private handleMetaMaskDisconnect() {
    console.log('MetaMask disconnected.');
    this.provider = undefined;
    this.signerSubject.next(undefined);
  }

  private async handleMetaMaskAccountsChanged(accounts: string[]) {
    console.log('MetaMask accounts changed:', accounts);
    this.provider = new ethers.BrowserProvider(
      window.ethereum as ethers.Eip1193Provider
    );
    const signer = await this.provider.getSigner();
    this.signerSubject.next(signer);
  }

  async connectToMetaMaskWallet(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await this.provider.getSigner();
      this.signerSubject.next(signer);
      const address = await signer.getAddress();
      console.log('Connected to MetaMask with address:', address);
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  getSigner(): Observable<ethers.Signer | undefined> {
    return this.signerSubject.asObservable();
  }
}
