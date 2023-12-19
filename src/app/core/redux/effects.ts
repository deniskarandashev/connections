import { catchError } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { LoginService } from "src/app/login/services/login.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { loginUser } from "./action";
import { EMPTY, exhaustMap } from "rxjs";
import { User } from "src/app/login/login.model";

@Injectable()
export class AppEffect {

    logInUser$ = createEffect(() => this.actions$
        .pipe(
            ofType(loginUser),
            exhaustMap((payload) => this.loginService
                .loginUser({...payload.user, loggedIn: true })),
                catchError(() => EMPTY)
        ));

    constructor(
        private actions$: Actions,
        private loginService: LoginService,
    ) { }
}