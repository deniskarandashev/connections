import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseResponseError, User } from 'src/app/login/login.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'rs-main-base',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './main-base.component.html',
  styleUrls: ['./main-base.component.scss']
})
export abstract class MainBaseComponent implements OnInit {
  user!: User;
  error: BaseResponseError = {} as BaseResponseError;
  isDark: boolean = false;
  constructor(private snackBar: MatSnackBar) {}
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close');
  }
  ngOnInit(): void {
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '');
    }
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
  }
}
