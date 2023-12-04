import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book/book.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account/account.service';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-showbook',
  templateUrl: './showbook.component.html',
  styleUrl: './showbook.component.css'
})
export class ShowbookComponent implements OnInit{

  loginData: any = {};
  bookData: any = {};
  isLoggedIn: boolean = false;

  constructor(private accountservice : AccountService,private bookservice : BookService, private route : ActivatedRoute, private router : Router, private cartservice : CartService) {}

  ngOnInit(): void {

    this.route.params.subscribe((data) => {
      const id = data['id'];
      this.bookservice.getBookByIdApi(id).subscribe((response) => {
        const httpresponse = response;
  
        if(httpresponse.status === 200){
          const jsondata: any = httpresponse.body;
          const data = jsondata.data;
          this.bookData = data;
        }
      })
    })

    this.accountservice.loginData$.subscribe((data) => {
      this.loginData = data;
    })

    this.loginData = JSON.parse(localStorage.getItem('loginData') || '{}');

  }

  addToCart(data: any){
    this.cartservice.addToCart(data);
  }

  checkOut(){
    this.router.navigate([""]);
  }

}
