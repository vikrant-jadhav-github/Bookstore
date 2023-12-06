import { CartService } from './services/cart/cart.service';
import { Component, OnInit } from '@angular/core';
import { LoaderService } from './services/loader/loader.service';
import { AccountService } from './services/account/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'store_front';

  loader: boolean = false;

  constructor(private loaderservice : LoaderService, private accountservice : AccountService, private toastr : ToastrService) { } 

  ngOnInit(): void {
    
      this.loaderservice.loader$.subscribe((data) => {
        this.loader = data
      })

      const getExpiry = JSON.parse(localStorage.getItem('time') || '{}');
      
      if(getExpiry && Date.now() > getExpiry) {
        this.accountservice.logoutApi();
        localStorage.clear();
        this.toastr.info("Session expired, Please login again!", "Information");
      }
  }

}
