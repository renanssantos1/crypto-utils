// crypto.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CryptoUtil } from './crypto-util';

@Injectable()
export class CryptoInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Somente para métodos com body
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      // Criptografar antes de enviar
      return CryptoUtil.encryptObject(req.body).pipe(
        switchMap(encryptedBody => {
          const encryptedReq = req.clone({ body: encryptedBody });
          return next.handle(encryptedReq);
        })
      );
    }

    return next.handle(req);
  }
}
