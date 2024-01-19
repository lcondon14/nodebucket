import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';


export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService)


  if (cookie.get('session._user')) {
  console.log("You are logged in and have a valid session cookie set!")
  return true 
} else {
  console.log('user is not logged in and cannot access the task page!')


  const router = inject(Router)
  router.navigate(['/security/signing'], { queryParams: { returnUrl: state.url }})
  return false
}
};
