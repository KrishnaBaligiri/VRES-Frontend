// src/app/auth/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Get the token from local storage (or wherever you stored it)
    //    !! IMPORTANT: Change 'token' to the actual key you use to save your JWT !!
    const token = localStorage.getItem('token'); 

    // 2. If the token exists, clone the request and add the auth header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. Pass the (possibly modified) request to the next handler
    return next.handle(request);
  }
}