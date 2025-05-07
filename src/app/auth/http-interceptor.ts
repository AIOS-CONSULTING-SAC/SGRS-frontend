import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, filter, finalize, switchMap, take, timeout } from 'rxjs/operators'

import { Router } from '@angular/router'
import { environment } from '../../enviroments/environment'
import { AutenticacionService } from './autenticacion.service'
import { MensajesToastService } from '../shared/mensajes-toast.service'

@Injectable({ providedIn: 'root' })
export class CustomHttpInterceptor implements HttpInterceptor {
  private readonly apiUrl = environment.apiRest.host
  private isRefreshingToken = false
  private readonly refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)

  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly mensajeToast: MensajesToastService,
    private readonly router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.esSolicitudRefreshToken(req)) {
      return next.handle(req) // No interceptar solicitudes de refresh token
    }
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      return next.handle(req)
    }

    const authToken = this.autenticacionService.obtenerToken()
    console.log('Token obtenidoxx: ', authToken);
    const contentType = req.headers.get('Content-Type') ?? 'application/json'
    const clonedReq = this.autorizacionCabecera(req, authToken, contentType)

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          return this.handle401Error(req, next, contentType)
        }
        return throwError(error)
      })
    )
  }

  private autorizacionCabecera(req: HttpRequest<any>, authToken: string | null, contentType: string): HttpRequest<any> {
    const headers: { [name: string]: string | string[] } = {
        'Content-Type': contentType
    };

    // Only add Authorization header if token exists
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken.trim()}`; // Ensure no whitespace
    }

    return req.clone({
        url: `${this.apiUrl}/${req.url.replace(/^\//, '')}`,
        setHeaders: headers,
        responseType: req.responseType ?? 'json'
    });
}

  private handle401Error(req: HttpRequest<any>, next: HttpHandler, contentType: string): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true
      this.refreshTokenSubject.next(null)

      return this.autenticacionService.refreshToken().pipe(
        switchMap((data: any) => {
          const newToken = data.token
          if (newToken) {
            this.refreshTokenSubject.next(newToken)
            return next.handle(this.autorizacionCabecera(req, newToken, contentType))
          } else {
            this.handleRefreshTokenFailure()
            return throwError(() => new Error('No se pudo renovar el token.'))
          }
        }),
        catchError((refreshError: any) => {
          if (refreshError.status === 403) {
            this.handleRefreshTokenFailure() // Siempre manejar el fallo aquí
          }
          return throwError(() => refreshError)
        }),
        finalize(() => (this.isRefreshingToken = false))
      )
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.autorizacionCabecera(req, token, contentType))),
        catchError((error) => {
          if (error.status === 401) {
            this.handleRefreshTokenFailure() 
          }
          return throwError(() => error)
        }),
        timeout(2000), 
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            this.handleRefreshTokenFailure()
          }
          return throwError(() => error)
        })
      )
    }
  }

  private handleRefreshTokenFailure(): void {
    this.refreshTokenSubject.next(null)
    this.autenticacionService.logout()
    this.router.navigate(['/login'])
    this.mensajeToast.advertencia('Sesión expirada', 'Por favor, inicia sesión nuevamente.')
  }

  private esSolicitudRefreshToken(req: HttpRequest<any>): boolean {
    return req.url.includes('/refresh-token')
  }
}
