import { registerNewUser } from './../../core/redux/action';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of } from 'rxjs';
import { User } from '../login.model';

@Injectable({
    providedIn: "root",
})
export class LoginService {
    currentUserName: string;

    readonly NO_LOGIN = "";
    readonly PROP_NAME = "userName";

    private readonly regUrl = 'https://tasks.app.rs.school/angular/registration';
    private readonly loginUrl = 'https://tasks.app.rs.school/angular/login';
    private readonly profileUrl = 'https://tasks.app.rs.school/angular/profile';
    private readonly logoutUrl = 'https://tasks.app.rs.school/angular/logout';

    constructor(private http: HttpClient) {
        this.currentUserName = localStorage.getItem(this.PROP_NAME) ?? this.NO_LOGIN;
    }

    public registerNewUser(user: User): Observable<any> {
        return this.http.post(this.regUrl, user);
    }

    public loginUser(user: User): Observable<any> {
        return this.http.post(this.loginUrl, user);
    }

    public getProfilData(user: User): Observable<any> {
        const headers = this.headers(user);
        return this.http.get(this.profileUrl, { headers });
    }

    public editUserName(user: User, name: string): Observable<any> {
        const headers = this.headers(user);
        return this.http.put(this.profileUrl, {name}, {headers: headers});
    }

    public logout(user: User): Observable<any> {
        const headers = this.headers(user);
        return this.http.delete(this.logoutUrl, {headers: headers});
    }

    private headers(user: User) {
        return {
            'Authorization': `Bearer ${user.token}` ?? '',
            'rs-uid': user.uid ?? '',
            'rs-email': user.email ?? ''
        };
    }
}