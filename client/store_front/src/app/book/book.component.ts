import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BookService } from '../services/book/book.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrl: './book.component.css',
})
export class BookComponent implements OnInit{
  bookData: any = {};
  searchQuery: any = "";
  searchedBooks: any = [];

  constructor(private router: Router, private bookservice : BookService) {}

  ngOnInit(): void {
    this.bookservice.getAllBooksApi();
    this.bookservice.bookData$.subscribe((data) => {
      this.bookData = data;
    })
  }

  goToBook(id: any){
    console.warn(id);
    
    this.router.navigate(['/Book', id]);
  }

  search(value: any){
    this.bookservice.getSearchBooksApi(value);
    this.bookservice.searchbookData$.subscribe((data) => {
      this.searchedBooks = data;
    })
  }

}
