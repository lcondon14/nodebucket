/**
 * Title: auth.guard.ts
 * Author: Laurel Condon
 * Date: 28 Jan 2024
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService);

  if (cookie.get('session_user')) {
    console.log('You are logged in and have a valid session cookie set!');
    return true;
  } else {
    console.log('You must be logged int o access this page!');

    const router = inject(Router);

    router.navigate(['/security/signin'], { queryParams: { returnUrl: state.url}});

    return false;
  }
};