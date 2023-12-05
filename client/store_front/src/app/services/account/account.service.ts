import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { login } from '../../models/datatype';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../loader/loader.service';
import { ApiconfigService } from '../apiconfig/apiconfig.service';
import * as EmailValidator from 'email-validator';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private tokenSubject = new BehaviorSubject<string>('');
  public tokenData$ = this.tokenSubject.asObservable();

  private isSuccessSubject = new BehaviorSubject<boolean>(false);
  public isSuccess$ = this.isSuccessSubject.asObservable();

  private loginSubject = new BehaviorSubject<any>({});
  public loginData$ = this.loginSubject.asObservable();

  private isUserLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isUserLoggedIn$ = this.isUserLoggedInSubject.asObservable();
  
  private domain = ``;

  constructor(
    private apiservice : ApiconfigService,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private loaderservice : LoaderService
    ) {
      this.domain = this.apiservice.getDomain() + `/api/v1/account/`;
    }

  isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@gmail\.com$/;
      return emailRegex.test(email);
  }

  isValidPassword(password: string): boolean {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUppercase && hasLowercase && hasDigit && (hasSpecialChar || true);
  }

  registerApi(data: any) {

    const userdata = data.userdata;
    const roledata = data.roledata;

    if (!userdata.email || !userdata.name || !userdata.password || !userdata.password2) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    if (!this.isValidEmail(userdata.email)) {
      this.toastr.error('Invalid email address, Please enter a valid email', 'Error');
      return;
    }

    if (!this.isValidPassword(userdata.password)) {
      this.toastr.error('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character', 'Error');
      return;
    }

    if (userdata.password !== userdata.password2) {
      this.toastr.error('Passwords do not match', 'Error');
      return;
    }

    if (userdata.role === 'Buyer') {
      if (!roledata.city || !roledata.state || !roledata.country || !roledata.landmark) {
        this.toastr.error('Buyer details are incomplete', 'Error');
        return;
      }
    } else if (userdata.role === 'Seller') {
      if (!roledata.storename || !roledata.totalproductsold) {
        this.toastr.error('Seller details are incomplete', 'Error');
        return;
      }
    }

    this.loaderservice.showLoader();

    this.http.post(`${this.domain}register/`, data, { observe: 'response' }).subscribe(
      (response) => {
        const httpresponse: any = response;

        if (httpresponse.status !== 200) {
          this.toastr.error('Registration failed. Please try again.', 'Error');
          this.loaderservice.hideLoader();
          return;
        }

        this.toastr.success('Registration successful', 'Success');
        this.loaderservice.hideLoader();
        this.isSuccessSubject.next(true);
      },
      (error) => {
        this.loaderservice.hideLoader();
        this.toastr.error('An unexpected error occurred. Please try again later.', 'Error');
        console.error(error);
      }
    );
  }
  loginApi(data: login) {

    if (!data.email || !data.password) {
      this.toastr.error('Please enter both email and password', 'Error');
      return;
    }

    if (!EmailValidator.validate(data.email)) {
      this.toastr.error('Invalid email address', 'Error');
      return;
    }

    this.loaderservice.showLoader();
    this.http.post(`${this.domain}login/`, data, { observe: 'response' }).subscribe(
      (response) => {
        const httpresponse: any = response;

        if (httpresponse.status !== 200) {
          this.toastr.error('Invalid email or password', 'Error');
          this.loaderservice.hideLoader();
          return;
        }

        const jsondata: any = httpresponse.body;
        const user = jsondata.user;

        this.loginSubject.next(user);
        this.isUserLoggedInSubject.next(true);
        this.tokenSubject.next(jsondata.token.access);

        localStorage.setItem('token', jsondata.token.access);
        localStorage.setItem('loginData', JSON.stringify(user));

        this.toastr.success('Login successful', 'Success');
        this.loaderservice.hideLoader();
        this.router.navigate(['Home']);
      },
      (error) => {
        this.loaderservice.hideLoader();
        this.toastr.error('An unexpected error occurred. Please try again later.', 'Error');
        console.error(error);
      }
    );
}


  logoutApi() {
    this.loaderservice.showLoader();
    this.loginSubject.next({});
    this.isUserLoggedInSubject.next(false);
    this.tokenSubject.next('');
    localStorage.clear();
    this.toastr.success('See you later', 'Success');
    this.loaderservice.hideLoader();
  }

}
