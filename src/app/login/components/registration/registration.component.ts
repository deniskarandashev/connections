import { Component, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LoginValidator } from '../../services/login-validator';
import { BaseLoginComponent } from '../base-login/base-login.component';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { AppState } from '../../login.model';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'rs-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
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
export class RegistrationComponent extends BaseLoginComponent {
  previousEmail!: string;

  constructor(
    private loginService: LoginService, 
    router: Router,
    store: Store<AppState>,
    snackBar: MatSnackBar
    ) {
    super(router, store, snackBar);
  }

  override initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
        LoginValidator.emailValidator(this.previousEmail)
      ]),
      password: new FormControl("", [
        Validators.required,
        LoginValidator.passwordValidator()
      ])
    });
  }

  register(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.deleteError();
    this.composeUser();
    this.loginService.registerNewUser(this.user).subscribe(response => {
      this.isLoading = false;
      this.previousEmail = '';
      this.openSnackBar("You are successfully registered");
      this.router.navigate(['/signin']);
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
      if (e.error.type === "PrimaryDuplicationException") {
        this.previousEmail = this.form.get('email')?.value;
      }
    })
  }

  get isSubmitDisabled(): boolean {
    return this.form.invalid || !!this.error.type || this.isLoading || (!!this.previousEmail && this.previousEmail === this.form.get('email')?.value);
  }
}
