import { Component, OnInit } from '@angular/core';
import { login } from '../models/datatype';
import { AccountService } from '../services/account/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userauth',
  templateUrl: './userauth.component.html',
  styleUrl: './userauth.component.css'
})
export class UserauthComponent implements OnInit{

  constructor(private accountservice : AccountService, private router : Router) { }

  selectedRole = "Buyer";
  isRegistered = false;
  isLoggedIn = false;

  userdata: any = {};
  roledata: any = {};

  ngOnInit(): void {

    this.accountservice.isUserLoggedIn$.subscribe((data) => {
      if(data){
        this.router.navigate(['/Home']);
      }
    })
  }
  
  register() {
    
    this.userdata.role = this.selectedRole;

    const data = {
      userdata : this.userdata,
      roledata : this.roledata
    }

    this.accountservice.registerApi(data);

  }

  login(data: login) {
    
    this.accountservice.loginApi(data);

  }


}
