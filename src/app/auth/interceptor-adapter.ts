// legacy-interceptor-adapter.ts
import { inject, Injector } from '@angular/core';
import { HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export function adaptLegacyInterceptor(
  InterceptorClass: new (...args: any[]) => HttpInterceptor
): HttpInterceptorFn {
  return (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const injector = inject(Injector);
    const interceptor = injector.get(InterceptorClass);
    return interceptor.intercept(req, { handle: next });
  };
}

