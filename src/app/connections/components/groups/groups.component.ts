import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainBaseComponent } from '../main-base/main-base.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { User } from 'src/app/login/login.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CreateGroupDialog } from './dialog/dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SecPersonDialog } from './del-dialog/del-dialog.component';
import { Route, Router } from '@angular/router';
import { GroupService } from '../../services/group-service.service';

@Component({
  selector: 'rs-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent extends MainBaseComponent implements OnInit {
  isUpdatePressed!: boolean;
  counterGroup!: number;
  groupsList!: any;
  isLoading: boolean = false;

  newGroupName: string = '';

  constructor(
    public groupService: GroupService,
    private dialog: MatDialog,
    snackBar: MatSnackBar,
    private router: Router
  ) {
    super(snackBar);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.groupService.isUpdatePressed = localStorage.getItem('isUpdatePressedGroup') === '1';
    if (this.groupService.isUpdatePressed) {
      this.calcCounter();
    }
    if (localStorage.getItem('groupsList') ) {
      this.groupsList = JSON.parse(localStorage.getItem('groupsList') ?? '');
    }
    if (!this.groupsList?.Items.length) {
      this.update();
    }
  }

  openDialog(): void {
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }

    const dialogRef = this.dialog.open(CreateGroupDialog, {
      data: { newGroupName: this.newGroupName },
      panelClass: this.isDark ? 'dark' : ''
    });

    let destroyDialogSub = new Subject<void>();
    dialogRef.componentInstance.submitClicked.pipe(
      takeUntil(destroyDialogSub)
    ).subscribe(
      result => {
        this.newGroupName = result;

        destroyDialogSub.next();
        destroyDialogSub.complete();
        this.groupService.createGroup(this.newGroupName).subscribe(r => {
          this.groupsList.Items.unshift({
            name: { S: this.newGroupName },
            createdBy: { S: this.user.uid },
            id: { S: r.groupID }
          });
          localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
          this.openSnackBar("Group is created");
          dialogRef.close();
        }, e => {
          this.error = e.error;
          this.openSnackBar(e?.error?.message ?? "Something went wrong");
          this.isLoading = false;
        })
      }, e => {
        this.openSnackBar(e?.error?.message ?? "Something went wrong");
        this.isLoading = false;
      }
    )
  }

  update() {
    this.groupService.startTimer();
    this.isLoading = true;
    this.groupService.getGroupsList().subscribe(result => {
      this.groupsList = result;
      this.isLoading = false;
      localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
      this.openSnackBar("Group list has updated");
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  deleteGroup(e: any, item: any) {
    e.stopPropagation();

    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
    
    const dialogRef = this.dialog.open(SecPersonDialog, {
      data: { groupId: item.id.S, name: item.name.S },
      panelClass: this.isDark ? 'dark' : ''
    });
  
    let destroyDialogSub = new Subject<void>();
    dialogRef.componentInstance.submitClicked.pipe(
      takeUntil(destroyDialogSub)
    ).subscribe(
      () => {
        destroyDialogSub.next();
        destroyDialogSub.complete();
        this.isLoading = true;
        this.groupService.deleteGroup(item.id.S).subscribe(r => {
          this.isLoading = false;
          this.groupsList.Items = this.groupsList.Items.filter((i: any) => i.id.S !== item.id.S);
          localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
          this.openSnackBar("Group has removed");
          dialogRef.close();
        }, e => {
          this.error = e.error;
          this.openSnackBar(e?.error?.message ?? "Something went wrong");
          this.isLoading = false;
        })
      }
    )
  }

  onGroupCard(item: any) {
    localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
    this.router.navigate(['/group/' + item.id.S]);
  }

  private calcCounter() {
    const startCounterTime: number = +(localStorage.getItem('startCounterTimeGroup') ?? '');
    const nowCounterTime: number = Math.round(Date.now() / 1000);

    const diff = 60 - (nowCounterTime - startCounterTime);

    if (diff >= 0 && diff <= 60) {
      this.groupService.counter = diff;
      this.groupService.isUpdatePressed = localStorage.getItem('isUpdatePressedGroup') === '1';
      this.groupService.interval(diff, 0.5);
    } else {
      this.groupService.counter = 60;
      this.groupService.isUpdatePressed = false;
    }
  }

  isMine(item: any) {
    return item?.createdBy?.S === this.user?.uid;
  }

  get count() {
    if (this.groupService.counter < 0) {
      this.groupService.counter = 60;
      this.groupService.isUpdatePressed = false;
    }
    return this.groupService.counter;
  }

  get updatePressed() {
    return this.groupService.isUpdatePressed;
  }
}
