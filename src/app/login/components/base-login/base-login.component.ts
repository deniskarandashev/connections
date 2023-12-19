import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppState, BaseResponseError, User } from '../../login.model';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { loginUser } from 'src/app/core/redux/action';
import { selectCurrentUser } from 'src/app/core/redux/selector';

@Component({
  selector: 'rs-base-login',
  templateUrl: './base-login.component.html',
  styleUrls: ['./base-login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export abstract class BaseLoginComponent implements OnInit, OnDestroy {
  protected form!: FormGroup;
  protected matcher = new ErrorStateMatcher();
  protected hide = true;
  protected isLoading = false;

  user: User = {} as User;
  user$ = this.store.select(selectCurrentUser);

  error: BaseResponseError = {} as BaseResponseError;

  constructor(
    public router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.deleteError();
    this.isLoading = false;
  }

  abstract initForm(): void;

  composeUser(): void {
    const name = this.getFormControl('name');
    const email = this.getFormControl('email');
    const password = this.getFormControl('password');

    if (name?.value) {
      this.user['name'] = name.value;
    }
    if (email?.value) {
      this.user['email'] = email.value;
    }
    if (password?.value) {
      this.user['password'] = password.value;
    }
  }

  public getFormControl(controlName: string) {
    return <FormControl>this.form.get(controlName);
  }

  goToRoute(route: string): void {
    this.router.navigate([route]);
  }

  deleteError(): void {
    if (!!this.error?.message) {
      this.error = {} as BaseResponseError;
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  storeCurrentUser(user: User): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(this.user));
      this.store.dispatch(loginUser({ user }));
    }
  }
}
