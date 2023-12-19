import { ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { delay, of, takeUntil } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from './core/redux/selector';
import { AppState, User } from './login/login.model';
import { Subject } from 'rxjs/internal/Subject';
import { loginUser } from './core/redux/action';
import { Route, Router } from '@angular/router';
import { LoginService } from './login/services/login.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user$ = this.store.select(selectCurrentUser);
  user: User = {} as User;
  destroy$ = new Subject<void>();
  isLoading: boolean = false;
  isDark: boolean = false;

  constructor(
    private store: Store<AppState>, 
    private route: Router,
    private loginService: LoginService,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
    const localStorageUserData = localStorage.getItem('user');
    if (localStorageUserData) {
      this.user = JSON.parse(localStorageUserData) as User;
      this.store.dispatch(loginUser({ user: this.user }));
    }
    
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => {
        if (u) {
          this.user = u;
          localStorage.setItem('user', JSON.stringify(u));
        }
      }, e => {
        this.openSnackBar(e?.error?.message ?? "Something went wrong");
        this.isLoading = false;
      }
    )

    if (!this.user?.uid) {
      this.route.navigate(['signin']);
    }
  }

  changeTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', JSON.stringify(this.isDark));
  }

  logOut() {  
    this.isLoading = true;
    if (!this.user?.uid) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '');
    }
    this.loginService.logout(this.user).subscribe(result => {
      this.openSnackBar("You are logged out. See you later!");
      this.removeLocalUserData();
    }, e => {
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
      if (e.error.type === 'InvalidTokenException') {
        this.removeLocalUserData();
      }
    })
  }

  private removeLocalUserData() {
    this.user = {} as User;
    this.route.navigate(['signin']);
    this.isLoading = false;
    window.localStorage.clear(); 
    window.location.reload();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get logged() {
    return localStorage.getItem('user')
  }
}
