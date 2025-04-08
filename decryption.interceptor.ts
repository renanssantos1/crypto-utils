// decryption.interceptor.ts


/**
 * providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CryptoInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DecryptionInterceptor,
      multi: true
    }
  ]
 */

import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Observable, from, isObservable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CryptoUtil } from './crypto-util';

@Injectable()
export class DecryptionInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            switchMap((event: HttpEvent<any>) => {
                // Se não for uma resposta com body, só retorna
                if (!(event instanceof HttpResponse) || !event.body) {
                    return of(event);
                }

                const body = event.body;

                // Se for array de objetos, descriptografa todos
                if (Array.isArray(body)) {
                    const decryptAll$ = body.map(item => CryptoUtil.decryptObject(item));
                    return forkJoin(decryptAll$).pipe(
                        map(decryptedArray => {
                            const newResponse = event.clone({ body: decryptedArray });
                            return newResponse;
                        })
                    );
                }

                // Se for objeto único
                return CryptoUtil.decryptObject(body).pipe(
                    map(decryptedBody => {
                        const newResponse = event.clone({ body: decryptedBody });
                        return newResponse;
                    })
                );
            })
        );
    }
}
