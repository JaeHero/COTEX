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
  private provider: ethers.BrowserProvider | undefined;
  private signer: BehaviorSubject<ethers.Signer | undefined> =
    new BehaviorSubject<ethers.Signer | undefined>(undefined);

  constructor(private ngZone: NgZone) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      this.provider.getSigner().then((signer) => this.signer.next(signer));

      // Listen for changes in MetaMask accounts
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.ngZone.run(() => {
          if (accounts.length === 0) {
            // MetaMask disconnected or switched accounts
            this.handleMetaMaskDisconnect();
          } else {
            // MetaMask accounts changed
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
    this.signer.next(undefined);
  }

  private async handleMetaMaskAccountsChanged(accounts: string[]) {
    console.log('MetaMask accounts changed:', accounts);
    this.provider = new ethers.BrowserProvider(
      window.ethereum as ethers.Eip1193Provider
    );
    const signer = await this.provider.getSigner();
    this.signer.next(signer);
  }

  async connectToMetaMaskWallet() {
    if (typeof window.ethereum !== 'undefined') {
      // Request access to the user's MetaMask account
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Connect to MetaMask using the Web3Provider
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.signer.next(signer);

      const address = await this.signer.getValue()!.getAddress();

      console.log('Connected to MetaMask with address:', address);
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  getSigner() {
    return this.signer.getValue();
  }
}
