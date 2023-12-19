import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable()
export class AuthGuard {
    constructor(private router: Router) {}

    canActivate(): boolean {
        if (localStorage.getItem("user")) {
            return true;
        }

        this.router.navigate(["signin"]);
        return false;
    }
}