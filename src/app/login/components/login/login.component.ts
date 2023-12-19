import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BaseLoginComponent } from '../base-login/base-login.component';
import { LoginValidator } from '../../services/login-validator';
import { CommonModule } from '@angular/common';
import { AppState, BaseResponseError } from '../../login.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoginService } from '../../services/login.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { loginUser } from 'src/app/core/redux/action';

@Component({
  selector: 'rs-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
  ],
})
export class LoginComponent extends BaseLoginComponent {

  constructor(
    private loginService: LoginService, 
    router: Router,
    store: Store<AppState>,
    snackBar: MatSnackBar
    ) {
    super(router, store, snackBar);
  }

  public override initForm(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl("", [
        Validators.required
      ])
    });
  }

  login(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = {} as BaseResponseError;
    this.composeUser();
    this.loginService.loginUser(this.user).subscribe(response => {
      this.isLoading = false;
      this.user = {...this.user, ...response, loggedIn: true};
      this.storeCurrentUser(this.user);
      this.openSnackBar("You are successfully logged in");
      this.router.navigate(['']);
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  
  register(): void {
    //
  }
}