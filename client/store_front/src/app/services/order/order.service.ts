import { ApiconfigService } from './../apiconfig/apiconfig.service';
import { LoaderService } from './../loader/loader.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private domain = ``;

  constructor(private apiservice : ApiconfigService, private loaderservice : LoaderService, private http: HttpClient, private router: Router, private toastr: ToastrService) { 

    this.domain = this.apiservice.getDomain() + `/api/v1/account/order/`;

  }

createOrderApi(data: any, token: any) {
  this.loaderservice.showLoader();
  this.http.post(this.domain, data, { observe: 'response', headers: { 'Authorization': 'Bearer ' + token } }).subscribe(
    (response) => {
      if (response.status !== 200) {
        this.toastr.error('Order creation failed', 'Error');
        this.loaderservice.hideLoader();
        return;
      }

      this.loaderservice.hideLoader();
      this.router.navigate(['Home/MyBooks']);
      this.toastr.success('Order created successfully', 'Success');
    },
    (error) => {
      this.loaderservice.hideLoader();
      this.toastr.error('Order creation failed', 'Error');
      console.error(error);
    }
  );
}

getOrdersApi(token: any) {
  try{
    this.loaderservice.showLoader();
  
    return this.http.get(this.domain, { 'observe': 'response', headers: { 'Authorization': 'Bearer ' + token } }).pipe(
      catchError(error => {
        this.toastr.error('Failed to fetch orders', 'Error');
        console.error(error);
        throw error;
      })
    );
  }
  finally{
    this.loaderservice.hideLoader();
  }
}

updateOrderApi(data: any, token: any, id: number) {
  this.loaderservice.showLoader();

  this.http.put(`${this.domain}${id}/`, data, { 'observe': 'response', headers: { 'Authorization': 'Bearer ' + token } }).subscribe(
    (response) => {
      if (response.status !== 200) {
        this.toastr.error('Order update failed', 'Error');
        this.loaderservice.hideLoader();
        return;
      }
      this.loaderservice.hideLoader();
      this.toastr.success('Order updated successfully', 'Success');
      console.warn(response);
    },
    (error) => {
      this.loaderservice.hideLoader();
      this.toastr.error('Order update failed, please try again', 'Error');
      console.error(error);
    }
  );
}

deleteOrderApi(id: number, token: any) {
  this.loaderservice.showLoader();

  this.http.delete(`${this.domain}${id}`, { 'observe': 'response', headers: { 'Authorization': 'Bearer ' + token } }).subscribe(
    (response) => {
      if (response.status !== 200) {
        this.toastr.error('Order deletion failed', 'Error');
        this.loaderservice.hideLoader();
        return;
      }
      this.loaderservice.hideLoader();
      this.toastr.success('Order deleted successfully', 'Success');
      console.warn(response);
    },
    (error) => {
      this.loaderservice.hideLoader();
      this.toastr.error('Order deletion failed', 'Error');
      console.error(error);
    }
  );
}

getInvoiceApi(id: number, token: any) {
  this.loaderservice.showLoader();
  const url = `http://localhost:8000/api/v1/account/bill/${id}/`;

  this.http.get(url, {
    headers: { 'Authorization': 'Bearer ' + token },
    observe: 'response',
    responseType: 'blob',
  }).subscribe(
    (response) => {
      if (response.status !== 200) {
        this.toastr.error('Failed to fetch invoice', 'Error');
        this.loaderservice.hideLoader();
        return;
      }

      const json: any = response;
      const blob = new Blob([json.body], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.loaderservice.hideLoader();
      window.open(url);
    },
    (error) => {
      this.loaderservice.hideLoader();
      this.toastr.error('Failed to fetch invoice', 'Error');
      console.error(error);
    }
  );
}


}
