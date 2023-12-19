import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GroupService } from 'src/app/connections/services/group-service.service';
import { SpecificGroupService } from 'src/app/connections/services/specific-group.service';
import { User } from 'src/app/login/login.model';
import { DeletePersonDialog } from '../../people/del-dialog/del-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConversationService } from 'src/app/connections/services/conversation.service';
import { Companion, Message } from 'src/app/connections/model';
import { Utils } from 'src/app/core/Utils';

@Component({
  selector: 'rs-conversation',
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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit, AfterViewInit, AfterViewChecked {
  conversationId!: string;
  groupsList!: any;
  specificGroup!: any;
  isUpdatePressed!: boolean;
  counterMessages!: number;
  messagesObj!: any;
  messages!: any;
  peopleList!: any;
  form!: FormGroup;
  isLoading: boolean = false;
  user!: User;
  companion!: Companion;
  isDark: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public messegerService: ConversationService,
    public groupService: GroupService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.companion = JSON.parse(localStorage.getItem('companionInfo') ?? '');
    this.user = JSON.parse(localStorage.getItem('user') ?? '');
    this.conversationId = this.route.snapshot.params['conversationID'];
    
    this.messages = this.messegerService.messagesList?.Items;
    if (this.messages) {
      localStorage.setItem('messages' + this.conversationId, JSON.stringify(this.messages));
    } else {
      if (localStorage.getItem('messages' + this.conversationId)) {
        this.messages = JSON.parse(localStorage.getItem('messages' + this.conversationId) ?? '');
      } else {
        this.update();
      }
    }
    this.initForm();

    this.messegerService.isUpdatePressed = localStorage.getItem('isUpdatePressedConversation' + this.conversationId) === '1';
    if (this.messegerService.isUpdatePressed) {
      this.calcCounter();
    }
    this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  goBack(): void {
    this.router.navigate([""]);
    Utils.clearAllIntervals();
  }

  update(since?: number) {
    this.messegerService.conversationId = this.conversationId;
    this.messegerService.startTimer();
    this.isLoading = true;
    this.messegerService.getConversation(this.conversationId, since).subscribe((result: any) => {
      this.isLoading = false;
      if (since) {
        this.sortMessages([...this.messages, ...result.Items]);
      } else {
        this.sortMessages(result.Items);
      }
      localStorage.setItem('messages' + this.conversationId, JSON.stringify(this.messages ?? ''))
      this.scrollToBottom();
    }, e => {
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.scrollToBottom();
      this.isLoading = false;
    })
  }

  getUserName(message: Message): string {
    if (message.authorID.S === this.user.uid) {
      return this.user.name;
    } else {
      return this.companion.name.S;
    }
  }

  private sortMessages(messages: Message[]) {
    this.messages = messages.sort((a: Message, b: Message) => {
      return +a.createdAt.S - +b.createdAt.S;
    })
  }

  private initForm(): void {
    this.form = new FormGroup({
      message: new FormControl(null, [])
    });
  }

  get message(): FormControl {
    return <FormControl>this.form.get('message');
  }

  @HostListener('window:keydown.enter', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.message?.value?.trim()) {
      this.isLoading = true;
      this.messegerService.addMessage(this.conversationId, this.message.value).subscribe(result => {
        this.isLoading = false;
        if (this.messages?.length === 0) {
          this.update();
        }
        if (this.messages[this.messagesObj?.length - 1]?.createdAt.S) {
          this.update(this.messagesObj[this.messagesObj.length - 1].createdAt.S)
        } else {
          this.update();
        }
        this.scrollToBottom();
      }, e => {
        this.openSnackBar(e?.error?.message ?? "Something went wrong");
        this.scrollToBottom();
        this.isLoading = false;
      })
      this.message.setValue('');
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  isMyMessage(message: any): boolean {
    return message?.authorID?.S === this?.user?.uid;
  }

  isMyGroup(): boolean {
    return this.specificGroup.createdBy.S === this.user.uid;
  }

  deleteConversation() {
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
  
    const dialogRef = this.dialog.open(DeletePersonDialog, {
      data: this.companion,
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
        if (!this.conversationId) {
          this.conversationId = this.route.snapshot.params['conversationID'];
        }
        this.messegerService.deleteConversation(this.conversationId).subscribe(r => {
          this.isLoading = false;
          let companionsIds = [];
          if (localStorage.getItem('companionIds')) {
            companionsIds = JSON.parse(localStorage.getItem('companionIds') ?? '');
          }
          if (companionsIds.includes(this.companion.uid.S)) {
            companionsIds = companionsIds.filter((c: any) => c != this.companion.uid.S);
            localStorage.setItem('companionIds', JSON.stringify(companionsIds));
          }
          if (localStorage.getItem('conversationsList')) {
            const conversationsList = JSON.parse(localStorage.getItem('conversationsList') ?? '');
            if (conversationsList) {
              conversationsList.filter((c: any) => c.id.S != this.conversationId);
              localStorage.setItem('conversationsList', JSON.stringify(conversationsList));
            }
          }

          localStorage.removeItem('messages' + this.conversationId);
          this.messages = null;
          this.messegerService.messagesList = null;
          this.openSnackBar("Chat has removed");
          dialogRef.close();
          // localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
          this.router.navigate(['']);
        }, e => {
          this.openSnackBar(e?.error?.message ?? "Something went wrong");
          this.isLoading = false;
        })
      }
    )
  }

  private calcCounter() {
    const startCounterTime: number = +(localStorage.getItem('startCounterTimeConversation' + this.conversationId) ?? '');
    const nowCounterTime: number = Math.round(Date.now() / 1000);

    const diff = 60 - (nowCounterTime - startCounterTime);

    if (diff >= 0 && diff <= 60) {
      this.messegerService.counter = diff;
      this.messegerService.isUpdatePressed = localStorage.getItem('isUpdatePressedConversation' + this.conversationId) === '1';
      this.messegerService.interval(diff, 0.5);
    } else {
      this.messegerService.counter = 60;
      this.messegerService.isUpdatePressed = false;
    }
  }

  get count() {
    if (this.messegerService.counter < 0) {
      this.messegerService.counter = 60;
      this.messegerService.isUpdatePressed = false;
    }
    return this.messegerService.counter;
  }

  get updatePressed(): boolean {
    return this.messegerService.isUpdatePressed;
  }
}