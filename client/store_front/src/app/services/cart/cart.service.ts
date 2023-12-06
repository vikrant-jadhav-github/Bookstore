import { LoaderService } from './../loader/loader.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService{

  isLoggedIn: boolean = false;
  cartItems: any = [];

  private cartItemssubject = new BehaviorSubject<any>([]);
  public cartItems$ = this.cartItemssubject.asObservable();

  constructor(private loaderservice : LoaderService,private router: Router, private toastr: ToastrService, private accountservice : AccountService) { }

  addToCart(item: any, quantity: any) {
    try {
      item.quantity = quantity;
      
      this.loaderservice.showLoader();
      this.cartItems.push(item);
      this.cartItemssubject.next(this.cartItems);

      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

      this.accountservice.isUserLoggedIn$.subscribe((data) => {
        this.isLoggedIn = data;
      })
      let token = localStorage.getItem('token');
  
      if(token)
        this.isLoggedIn = true;
      
      if (!this.isLoggedIn)
        this.router.navigate(['Cart']);
      else
        this.router.navigate(['Home/Cart']);
    } catch (error) {
      this.toastr.error('An unexpected error occurred while adding to cart.', 'Error');
      console.error(error);
    }
    finally {
      this.loaderservice.hideLoader();
      this.toastr.success('Book added to cart successfully.', 'Success');
    }
  }

  getCartItems() {
    try {
      this.loaderservice.showLoader();
      if (this.cartItems.length === 0)
      {  
        this.cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        this.cartItemssubject.next(this.cartItems);
      }
      return this.cartItems;
    } catch (error) {
      this.toastr.error('An unexpected error occurred while fetching cart items.', 'Error');
      console.error(error);
      return [];
    }
    finally {
      this.loaderservice.hideLoader();
    }
  }

  removeFromCart(item: any) {
    try {
      this.loaderservice.showLoader();
      const index = this.cartItems.indexOf(item);
      if (index > -1) {
        this.cartItems.splice(index, 1);
        this.cartItemssubject.next(this.cartItems);
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      }

      this.accountservice.isUserLoggedIn$.subscribe((data) => {
        this.isLoggedIn = data;
      })
      let token = localStorage.getItem('token');
  
      if(token)
        this.isLoggedIn = true;

      if (!this.isLoggedIn)
        this.router.navigate(['/Book']);
      else
        this.router.navigate(['Home']);
    } catch (error) {
      this.toastr.error('An unexpected error occurred while removing from cart.', 'Error');
      console.error(error);
    }
    finally {
      this.loaderservice.hideLoader();
      this.toastr.success('Book removed from cart successfully.', 'Success');
    }
  }

  clearCart() {
    try {
      this.loaderservice.showLoader();
      this.cartItems = [];
      this.cartItemssubject.next(this.cartItems);
      localStorage.removeItem('cartItems');
      this.toastr.success('Cart cleared successfully.', 'Success');
    } catch (error) {
      this.toastr.error('An unexpected error occurred while clearing the cart.', 'Error');
      console.error(error);
    }
    finally {
      this.loaderservice.hideLoader();
    }
  }

}
