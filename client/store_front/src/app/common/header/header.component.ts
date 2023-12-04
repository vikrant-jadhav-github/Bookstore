import { Component } from '@angular/core';
import { AccountService } from '../../services/account/account.service';
import { OnInit } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  loginData: any = {};
  isLoggedIn = false;

  cartItems: any = [];

  constructor(private accountservice : AccountService, private cartservice : CartService) { }

  ngOnInit(): void {
    
    this.cartItems = this.cartservice.getCartItems();
    
    this.accountservice.loginData$.subscribe((data) => {
        this.loginData = data;
      })

    this.accountservice.isUserLoggedIn$.subscribe((data) => {
        this.isLoggedIn = data;
      })

    const token = localStorage.getItem('token');

    const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');

    if(loginData){
      this.loginData = loginData;
    }
    
    if(token){
      this.isLoggedIn = true;
    }

  }

  logout(){

    this.accountservice.logoutApi();
    this.loginData = {};
    this.isLoggedIn = false;

  }

}
