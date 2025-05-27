import { Component } from '@angular/core';
import { MetamaskService } from '../services/metamask.service';
import { ethers } from 'ethers';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private mm: MetamaskService) {}
  account: string | null = null;

  async ngOnInit() {
    this.mm.account$.subscribe((acc) => {
      this.account = acc;
      if (!acc) {
        console.warn('MetaMask disconnected or locked');
      }
    });

    await this.getBalance();
  }

  onConnect() {
    this.mm.connect().catch((err) => console.error(err));
  }

  async getBalance() {
    const provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/638285737a5049bd9d5a571261b0ba8b`
    );
    const balance = await provider.getBalance(
      '0x68416deBc20D13e5Ef694CdCaC9506F4C1A20184'
    );
    console.log(`ETH Balance is ${ethers.formatEther(balance)} ETH`);
  }
}
