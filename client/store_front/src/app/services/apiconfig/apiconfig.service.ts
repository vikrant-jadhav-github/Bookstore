import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiconfigService {

  private domain = `http://localhost:8000`;

  constructor() { }

  getDomain() {
    return this.domain;
  }

}
