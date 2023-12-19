import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { AppState, Profile, User } from '../../login.model';
import { BaseLoginComponent } from '../base-login/base-login.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginValidator } from '../../services/login-validator';
import { Utils } from 'src/app/core/Utils';

@Component({
  selector: 'rs-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent extends BaseLoginComponent implements OnInit {
  isEditMode: boolean = false;
  profile: Profile = {} as Profile;
  constructor(
    private loginService: LoginService,
    router: Router,
    store: Store<AppState>,
    snackBar: MatSnackBar
  ) {
    super(router, store, snackBar);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadUserProfife();
  }

  override initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(
        this.profile.name, [
        Validators.required
      ]),
      email: new FormControl({ 
        value: this.profile.email, disabled: true }, [
        Validators.required,
        Validators.email
      ]),
      createdAt: new FormControl({ 
        value: this.profile.createdAt, disabled: true }, [
        Validators.required,
      ]),
      uid: new FormControl({ 
        value: this.profile.uid, disabled: true }, [
        Validators.required,
      ])
    });
  }

  private loadUserProfife(): void {

    this.user = JSON.parse(localStorage.getItem('user') ?? '') ?? {} as User;
    if (localStorage.getItem('profile')) {
      this.profile = JSON.parse(localStorage.getItem('profile') ?? '') ?? {} as Profile;
    }
    

    if (!this.user?.name) {
      this.loadData(this.user);
    } else {
      this.fillForm(this.user);
    }
  }

  loadData(user: User) {
    this.isLoading = true;
    this.loginService.getProfilData(user).subscribe((result: Profile) => {      
      this.fillForm(result);
      this.profile = result;
      localStorage.setItem('profile', JSON.stringify(this.profile));
      localStorage.setItem('user', JSON.stringify({...user, name: result.name.S, createdAt: result.createdAt.S }));
      this.isLoading = false;
    }, e => {
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }


  edit(type: number) {
    if (type === 0) {
      this.form.get('name')?.setValue(
        this.user?.name ?? this.profile?.name?.S ?? '');
        this.toggleEditMode();
    } else {
      if (this.isEditMode) {
        this.doEdit();
      } else {
        this.toggleEditMode();
      }
    }
  }

  private doEdit() {
    if (this.form.invalid) {
      return;
    }
    const newName = this.form.get('name')?.value;
    this.isLoading = true;
    this.loginService.editUserName(this.user, newName).subscribe(result => {
      // this.user.name = newName;
      localStorage.setItem('user', JSON.stringify(this.user));
      this.isLoading = false;
      this.toggleEditMode();
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  private toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  private fillForm(data: Profile | User): void {
    const fields = ['name', 'email', 'createdAt', 'uid'];
    fields.forEach(f => {
      if ((data as Profile)?.email?.S) {
        this.setControlProfileData(f, data as Profile);
      } else {
        this.setControlUserData(f, data as User);
      }
    })
  }

  private setControlProfileData(field: string, profile: Profile): void {
    const c = this.form.get(field);
    if (c) {
      c.setValue(profile[field as keyof Profile].S as string)
    }
  }

  private setControlUserData(field: string, user: User): void {
    const c = this.form.get(field);
    if (c) {
      c.setValue(user[field as keyof User] as string ?? '')
    }
  }

  goBack() {
    this.router.navigate(['']);
    Utils.clearAllIntervals();
  }

}
