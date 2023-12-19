import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { User } from 'src/app/login/login.model';
import { Router } from '@angular/router';

@Component({
  selector: 'rs-page-not-found',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  user!: User;
  constructor(public router: Router){}
  ngOnInit(): void {
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '');
    }
  }
  
  goToMain() {
    this.router.navigate(['']);
  }
}
