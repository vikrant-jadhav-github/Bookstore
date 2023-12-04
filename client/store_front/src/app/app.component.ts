import { Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'store_front';

  loader: boolean = false;

  constructor(private loaderservice : LoaderService) { } 

  ngOnInit(): void {
      this.loaderservice.loader$.subscribe((data) => {
        this.loader = data
      })
  }

}
