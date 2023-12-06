import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiconfigService {

  private domain = `http://13.126.195.107:8000`;

  constructor() { }

  getDomain() {
    return this.domain;
  }

}
