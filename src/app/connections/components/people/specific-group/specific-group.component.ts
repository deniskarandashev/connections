import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Utils } from 'src/app/core/Utils';

@Component({
  selector: 'rs-specific-group',
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
  templateUrl: './specific-group.component.html',
  styleUrls: ['./specific-group.component.scss']
})
export class SpecificGroupComponent implements OnInit {
  groupsList!: any;
  specificGroup!: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const groupId = this.route.snapshot.params['groupID'];
    this.groupsList = JSON.parse(localStorage.getItem('groupsList') ?? '');
    this.groupsList.Items.forEach((i: any) => {
      if (i.id.S === groupId) {
        this.specificGroup = i;
        return;
      }
    })
    if (!this.specificGroup) {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate([""]);
    Utils.clearAllIntervals();
  }

}
