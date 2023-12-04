import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './common/home/home.component';
import { BookComponent } from './book/book.component';
import { ShowbookComponent } from './book/showbook/showbook.component';
import { BookformComponent } from './book/bookform/bookform.component';
import { MybooksComponent } from './common/home/mybooks/mybooks.component';
import { UserauthComponent } from './userauth/userauth.component';
import { userauthGuard } from './guard/userguard/userauth.guard';
import { CartComponent } from './common/cart/cart.component';

const routes: Routes = [
  {
    path : "",
    component : UserauthComponent,
  },
  {
    path : "Cart",
    component : CartComponent,
  },
  {
    path : "Home",
    component : HomeComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Home/ChangeBook",
    component : BookformComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Home/ChangeBook/:id",
    component : BookformComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Home/MyBooks",
    component : MybooksComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Home/Book/:id",
    component : ShowbookComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Home/Cart",
    component : CartComponent,
    canActivate : [userauthGuard],
  },
  {
    path : "Book",
    component : BookComponent,
  },
  {
    path : "Book/:id",
    component : ShowbookComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
