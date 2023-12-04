import { ApiconfigService } from './../apiconfig/apiconfig.service';
import { LoaderService } from './../loader/loader.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, of } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private allbookSubject = new BehaviorSubject<any>([]);
  public bookData$ = this.allbookSubject.asObservable();

  private searchbookSubject = new BehaviorSubject<any>([]);
  public searchbookData$ = this.searchbookSubject.asObservable();

  private domain = ``;

  constructor(private apiservice : ApiconfigService, private loaderservice : LoaderService,private http: HttpClient, private router: Router, private toastr: ToastrService) { 

    this.domain = this.apiservice.getDomain() + `/api/v1/book/bookapi/`;

  }

  getAllBooksApi() {
    try{
      this.loaderservice.showLoader();
      this.http.get(this.domain, { 'observe': 'response' }).subscribe((response) => {
  
        const httpresponse = response;
  
        if (httpresponse.status !== 200) {
          this.toastr.error('An unexpected error occurred while fetching books.', 'Error');
          return;
        }
  
        const jsondata: any = httpresponse.body;
        const books = jsondata.data;
  
        this.allbookSubject.next(books);
  
        localStorage.setItem('bookData', JSON.stringify(books));
  
      }, error => {
        this.toastr.error('An unexpected error occurred while fetching books.', 'Error');
        console.error(error);
      });
    }
    finally{
      this.loaderservice.hideLoader();
    }
  }

  getBookByIdApi(id: number) {
    try{
      const url = `${this.domain}${id}`.replace("{id}", id.toString());
      return this.http.get(url, { 'observe': 'response' });
    }
    finally{
      this.loaderservice.hideLoader();
    }
  }

  createBookApi(data: any, token: any) {
    let formData = new FormData();

    formData.append('title', data.title);
    formData.append('author', data.author);
    formData.append('price', data.price);
    formData.append('totalsold', data.totalsold);
    formData.append('totalavailable', data.totalavailable);
    formData.append('genre', data.genre);
    formData.append('cover', data.cover);

    if (!data.title || !data.author || !data.price || !data.totalsold || !data.totalavailable || !data.genre || !data.cover) {
      this.toastr.error('Please fill in all required fields.', 'Error');
      return;
    }
    this.loaderservice.showLoader();
    this.http.post(this.domain, formData, { observe: 'response', headers: { 'Authorization': 'Bearer ' + token } }).subscribe((response) => {

      const httpresponse = response;

      if (httpresponse.status !== 200) {
        this.toastr.error('An unexpected error occurred while creating the book.', 'Error');
        this.loaderservice.hideLoader();
        return;
      }
      this.loaderservice.hideLoader();
      this.router.navigate(['Home/MyBooks']);
      this.toastr.success('Book created successfully.', 'Success');

    }, error => {
      this.loaderservice.hideLoader();
      this.toastr.error('An unexpected error occurred while creating the book.', 'Error');
      console.error(error);
    });
  }

  getSellerBooksApi(token: any) {
    try{
      this.loaderservice.showLoader();
      return this.http.get(`${this.domain}seller/`, { headers: { 'Authorization': 'Bearer ' + token }, 'observe': 'response' });
    }
    finally{
      this.loaderservice.hideLoader();
    }
  }

  editBookApi(id: number, data: any, token: any) {

    let formData = new FormData();

    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.author) {
      formData.append('author', data.author);
    }
    if (data.price) {
      formData.append('price', data.price);
    }
    if (data.totalsold) {
      formData.append('totalsold', data.totalsold);
    }
    if (data.totalavailable) {
      formData.append('totalavailable', data.totalavailable);
    }
    if (data.genre) {
      formData.append('genre', data.genre);
    }
    if (data.cover) {
      formData.append('cover', data.cover);
    }

    if (!data.title && !data.author && !data.price && !data.totalsold && !data.totalavailable && !data.genre && !data.cover) {
      this.toastr.error('Please provide at least one field to update.', 'Error');
      return;
    }

    this.loaderservice.showLoader();

    this.http.put(`${this.domain}${id}`, formData, { headers: { 'Authorization': 'Bearer ' + token }, 'observe': 'response' }).subscribe((response) => {
      this.loaderservice.hideLoader();
      this.router.navigate(['Home/MyBooks']);
      this.toastr.success('Book updated successfully.', 'Success');
    }, error => {
      this.loaderservice.hideLoader();
      this.toastr.error('An unexpected error occurred while updating the book.', 'Error');
      console.error(error);
    });
  }

  getSearchBooksApi(searchQuery: any) {
    const url1 = `${this.domain}?genre=${searchQuery}`;
    const url2 = `${this.domain}?title=${searchQuery}`;
    const url3 = `${this.domain}?author=${searchQuery}`;

    let flag = 0;

    this.loaderservice.showLoader();

    this.http.get(url1, { 'observe': 'response' }).subscribe((response) => {

      const httpresponse: any = response;
      if (httpresponse.status !== 200) {
        this.loaderservice.hideLoader();
        return;
      }
      const jsondata: any = httpresponse.body;
      this.searchbookSubject.next(jsondata.data)

      if (jsondata?.data?.length > 0)
        flag = 1

    })

    if (flag === 0) {

      this.http.get(url2, { 'observe': 'response' }).subscribe((response) => {

        const httpresponse: any = response;
        if (httpresponse.status !== 200) {
          this.loaderservice.hideLoader();
          return;
        }
        const jsondata: any = httpresponse.body;

        this.searchbookSubject.next(jsondata.data)

        if (jsondata?.data?.length > 0)
          flag = 1

      })
    }

    if (flag === 0) {

      this.http.get(url3, { 'observe': 'response' }).subscribe((response) => {

        const httpresponse: any = response;
        if (httpresponse.status !== 200) {
          this.loaderservice.hideLoader();
          return;
        }
        const jsondata: any = httpresponse.body;
        this.searchbookSubject.next(jsondata.data)

        if (jsondata?.data?.length > 0)
          flag = 1
      })
    }
    this.loaderservice.hideLoader();
  }

  deleteBookApi(id: number, token: any) {
    this.loaderservice.showLoader();

    this.http.delete(`${this.domain}${id}`, { headers: { 'Authorization': 'Bearer ' + token }, 'observe': 'response' }).subscribe((response) => {
      if (response.status !== 200) {
        this.toastr.error('An unexpected error occurred while deleting the book.', 'Error');
        this.loaderservice.hideLoader();
        return;
      }
      this.toastr.success('Book deleted successfully.', 'Success');
      this.loaderservice.hideLoader();
      this.router.navigate(['Home/MyBooks']);

    }, error => {
      this.loaderservice.hideLoader();
      this.toastr.error('An unexpected error occurred while deleting the book.', 'Error');
      console.error(error);
    });
  }

}
