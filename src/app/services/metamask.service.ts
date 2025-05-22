// src/app/services/metamask.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class MetamaskService {
  private accountSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accs: string[]) => this.handleAccountsChanged(accs))
        .catch(console.error);

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.handleAccountsChanged(accounts);
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        window.location.reload();
      });
    }
  }

  get account$(): Observable<string | null> {
    return this.accountSubject.asObservable();
  }

  async connect(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      this.handleAccountsChanged(accounts);
      return this.accountSubject.value;
    } catch {
      return null;
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    if (!accounts || accounts.length === 0) {
      this.accountSubject.next(null);
    } else if (accounts[0] !== this.accountSubject.value) {
      this.accountSubject.next(accounts[0]);
      console.log(accounts);
    }
  }
}
