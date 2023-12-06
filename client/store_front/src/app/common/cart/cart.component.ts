import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { AccountService } from '../../services/account/account.service';
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{

  isLoggedIn: boolean = false
  cartItems: any = []

  isPurchasing: boolean = false;
  isPurchasingAll: boolean = false;
  purchasingBookId: any = "";
  sellerId: any = "";
  token: any = "";
  reqestedQuantity: number = 1;
  totalprice = 0;

  loginData: any = {};
  purchasingData: any = {};

  purchasingBook: any = {};

  constructor(private cartservice : CartService, private accountservice : AccountService, private orderservice : OrderService) { }

  ngOnInit(): void {
    
    this.cartItems = this.cartservice.getCartItems();
    
    this.accountservice.isUserLoggedIn$.subscribe((data) => {
      this.isLoggedIn = data;
    })
    
    this.accountservice.tokenData$.subscribe((data) => {
      this.token = data;
    })

    this.accountservice.loginData$.subscribe((data) => {
      this.loginData = data;  
    })

    let token = localStorage.getItem('token');
    let loginData = JSON.parse(localStorage.getItem('loginData') || '{}');

    if(token)
      this.isLoggedIn = true

    if(token)
      this.token = token

    if(loginData)
      this.loginData = loginData

    this.totalprice = this.cartItems.reduce((acc: number, item: any) => {
      acc += (item.price * item.quantity)
      return acc
    }, 0)
    
      
  }
  createOrder(data: any){
    data.book = this.purchasingBookId;
    data.seller = this.sellerId;
    this.orderservice.createOrderApi(data, this.token);
    this.cartservice.removeFromCart(this.purchasingBook);
    this.isPurchasing = false;
    this.purchasingBookId = "";
    this.sellerId = "";
  }

  initPurchase(bookid: any, sellerid: any, purchasingBook: any){
    this.isPurchasing = true;
    this.purchasingBookId = bookid;
    this.sellerId = sellerid;
    this.purchasingBook = purchasingBook;
  }

  deleteItem(item: any){
    this.cartservice.removeFromCart(item);
    this.cartItems = this.cartservice.getCartItems();
  }

  initPurchaseAll(){
    this.isPurchasingAll = true;
    this.isPurchasing = true;
  }

  purchaseAll(data: any){
    const address = data.address
    let jsonData: any = [];
    this.cartItems.forEach((item: any) => {
      jsonData.push({
        book : item.id,
        quantity : item.quantity,
        address : address,
        seller : item.seller.id,
      })
    })
    this.orderservice.createOrderApi(jsonData, this.token);
    this.isPurchasing = false;
    this.isPurchasingAll = false;
    this.cartservice.clearCart();
  }

}
