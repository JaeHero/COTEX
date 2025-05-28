import { Injectable } from '@angular/core';
import { MetamaskService } from './metamask.service';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public contract: ethers.Contract = {} as ethers.Contract;

  constructor(private mm: MetamaskService) {}

  getContract(address: any, abi: any) {
    this.mm.getSigner().subscribe((signer: ethers.Signer | undefined) => {
      if (!signer) {
        console.log('Need to be signed in to get contracts!');
        return;
      }
      this.contract = new ethers.Contract(address, abi, signer);
      console.log(this.contract);
    });
  }
}
