import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../services/account/account.service';

export const userauthGuard: CanActivateFn = (route, state) => {
  
  const accountService = inject(AccountService);
  const router = inject(Router);
  let isLoggedIn = false;
  accountService.isUserLoggedIn$.subscribe((data) => {
    isLoggedIn = data
  })
  let token = localStorage.getItem('token');
  if(token)
    isLoggedIn = true

  if(!isLoggedIn){
    router.navigate(['']);
  }
  
  return isLoggedIn;

};
