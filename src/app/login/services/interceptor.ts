// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
// import { Store, select } from "@ngrx/store";
// import { Observable, first, mergeMap } from "rxjs";
// import { AppState } from "../login.model";

// export class AddTokenHeaderHttpRequestInterceptor implements HttpInterceptor {
    
//     constructor(private store$: Store<AppState>) {}
    
//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         return this.addToken(request).pipe(
//             first(),
//             mergeMap((requestWithToken: HttpRequest<any>) => next.handle(requestWithToken))
//         ); 
//     }

//     private addToken(request: HttpRequest<any>): Observable<HttpRequest<any>> {
//         return this.store$.pipe(
//             select(fromState.getToken),
//             first(),
//             mergeMap((token: string) => {
//                 if (token) {
//                     request = request.clone({
//                         headers: request.headers.set("Authorization", `Bearer ${token}`),
//                         withCredentials: true
//                     });
//                 } else {
//                     console.warn(`Invalid token!!! Cannot use token "${token}".`);
//                 }
//                 return of(request);
//             })
//         );
//     }
    
// }