import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateFn,
  UrlTree,
} from '@angular/router';
import { AutenticacionService } from './autenticacion.service';
import { Observable } from 'rxjs';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {

  const router: Router = inject(Router);
  const autenticacionService: AutenticacionService = inject(AutenticacionService);

  const token = autenticacionService.obtenerToken();
  if (token && autenticacionService.estaAutenticado()) {
    return true;
  }
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  autenticacionService.logout();
  return false;

}