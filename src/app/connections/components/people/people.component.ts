import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainBaseComponent } from '../main-base/main-base.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PeopleService } from '../../services/people.service';
import { PersonDialog } from './dialog/dialog.component';
import { ConversationService } from '../../services/conversation.service';
import { Companion, Conversation } from '../../model';
import { Utils } from 'src/app/core/Utils';

@Component({
  selector: 'rs-people',
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
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent extends MainBaseComponent implements OnInit {
  isUpdatePressed!: boolean;
  counter!: number;
  peopleList!: any;
  conversationsList!: Conversation[];
  companionIds: string[] = [];
  isLoading: boolean = false;

  newGroupName: string = '';

  constructor(
    public peopleService: PeopleService,
    public conversationService: ConversationService,
    private dialog: MatDialog,
    snackBar: MatSnackBar,
    private router: Router
  ) {
    super(snackBar);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
    this.peopleService.isUpdatePressed = localStorage.getItem('isUpdatePressedPeople') === '1';
    if (this.peopleService.isUpdatePressed) {
      this.calcCounter();
    }
    if (localStorage.getItem('peopleList')) {
      this.peopleList = JSON.parse(localStorage.getItem('peopleList') ?? '');
    }
    if (localStorage.getItem('companionIds')) {
      this.companionIds = JSON.parse(localStorage.getItem('companionIds') ?? '');
    }
    if (localStorage.getItem('conversationsList')) {
      this.conversationsList = JSON.parse(localStorage.getItem('conversationsList') ?? '');
    }
    
    if (!this.peopleList?.Items?.length) {
      this.update();
    } 
  }

  openDialog(): void {
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
    
    const dialogRef = this.dialog.open(PersonDialog, {
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
      }
    )
  }

  update() {
    this.peopleService.startTimer();
    this.isLoading = true;
    this.peopleService.getPeopleList().subscribe(result => {
      this.peopleList = result;
      this.isLoading = false;
      localStorage.setItem('peopleList', JSON.stringify(this.peopleList));
      this.getConversations()
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  private getConversations() {
    this.isLoading = true;
    this.peopleService.getConversationsList().subscribe(result => {
      this.conversationsList = result.Items;
      this.isLoading = false;
      localStorage.setItem('conversationsList', JSON.stringify(this.conversationsList));
      this.setConversationMark();
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  isCompanion(item: any): boolean {
    return this.companionIds.includes(item.uid.S);
  }

  private setConversationMark() {
    this.companionIds = this.conversationsList.map((item: any) => item.companionID.S);
    localStorage.setItem('companionIds', JSON.stringify(this.companionIds));
  }

  startConversation(item: any) {
    localStorage.setItem('companionIds', JSON.stringify(this.companionIds));
    localStorage.setItem('peopleList', JSON.stringify(this.peopleList));
    localStorage.setItem('conversationsList', JSON.stringify(this.conversationsList));
    this.isLoading = true;
    if (this.isCompanion(item)) {
      this.openConversation(item);
    } else {
      this.createNewConversation(item);
    }
  }

  private createNewConversation(item: any) {
    this.isLoading = true;
    this.peopleService.createConversation(item.uid.S).subscribe(result => {
      this.isLoading = false;
      this.companionIds.push(item.uid.S);
      const newConv: Conversation = {
        companionID: {S: item.uid.S},
        id: {S: result.conversationID}
      }
      this.conversationsList.push(newConv);
      localStorage.setItem('conversationsList', JSON.stringify(this.conversationsList));
      localStorage.setItem('companionIds', JSON.stringify(this.companionIds));
      localStorage.setItem('companionInfo', JSON.stringify(item))
      this.router.navigate(['/conversation/' + result.conversationID]);
    }, e => {
      this.error = e.error;
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  private openConversation(item: Companion) {
    // this.conversationService.update(this.isLoading, messagesList, item.uid.S);
    this.conversationService.startTimer();
    this.isLoading = true;
    const conv = this.findConversationForCompanion(item);
    const conversationId = conv ? conv.id.S : ''; 
    this.conversationService
      .getConversation(conversationId)
      .subscribe(result => {
        this.conversationService.messagesList = result;
        this.isLoading = false;
        this.router.navigate(["/conversation/" + conversationId]);
        localStorage.setItem('messages' + conversationId, JSON.stringify(this.conversationService.messagesList));
        localStorage.setItem('companionInfo', JSON.stringify(item))
      }, e => {
        console.log(e);
        
        this.openSnackBar(e?.error?.message ?? "Something went wrong");
        this.isLoading = false;
      })
  }

  private findConversationForCompanion(item: Companion) {
    const res = this.conversationsList.find((i: any) => {
      return i.companionID.S === item.uid.S;
    })
    return res ?? '';
  }

  goBack(): void {
    this.router.navigate([""]);
    Utils.clearAllIntervals();
  }

  private calcCounter() {
    const startCounterTime: number = +(localStorage.getItem('startCounterTimePeople') ?? '');
    const nowCounterTime: number = Math.round(Date.now() / 1000);

    const diff = 60 - (nowCounterTime - startCounterTime);

    if (diff >= 0 && diff <= 60) {
      this.peopleService.counter = diff;
      this.peopleService.isUpdatePressed = localStorage.getItem('isUpdatePressedPeople') === '1';
      this.peopleService.interval(diff, 0.5);
    } else {
      this.peopleService.counter = 60;
      this.peopleService.isUpdatePressed = false;
    }
  }

  isMine(item: any) {
    return item.createdBy.S === this.user.uid;
  }

  get count() {
    if (this.peopleService.counter < 0) {
      this.peopleService.counter = 60;
      this.peopleService.isUpdatePressed = false;
    }
    return this.peopleService.counter;
  }

  get updatePressed() {
    return this.peopleService.isUpdatePressed;
  }
}
