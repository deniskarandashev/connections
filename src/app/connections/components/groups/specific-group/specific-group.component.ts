import { Subject, first, takeUntil } from 'rxjs';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpecificGroupService } from 'src/app/connections/services/specific-group.service';
import { User } from 'src/app/login/login.model';
import { SecPersonDialog } from '../del-dialog/del-dialog.component';
import { GroupService } from 'src/app/connections/services/group-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './specific-group.component.html',
  styleUrls: ['./specific-group.component.scss']
})
export class SpecificGroupComponent implements OnInit, AfterViewInit {
  groupId!: string;
  groupsList!: any;
  specificGroup!: any;
  isUpdatePressed!: boolean;
  counterMessages!: number;
  messages!: any[];
  peopleList!: any;
  form!: FormGroup;
  isLoading: boolean = false;
  user!: User;
  isDark: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public messegerService: SpecificGroupService,
    public groupService: GroupService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user') ?? '');
    }
    this.groupId = this.route.snapshot.params['groupID'];
    if (localStorage.getItem('groupsList')) {
      this.groupsList = JSON.parse(localStorage.getItem('groupsList') ?? '');
    }
    if (localStorage.getItem('messages' + this.groupId)) {
      this.sortMessages(JSON.parse(localStorage.getItem('messages' + this.groupId) ?? ''));
    } else {
      this.update();
    }
    if (localStorage.getItem('peopleList')) {
      this.peopleList = JSON.parse(localStorage.getItem('peopleList') ?? '');
      this.groupsList?.Items?.forEach((i: any) => {
        if (i.id.S === this.groupId) {
          this.specificGroup = i;
          return;
        }
      })
    }

    this.messegerService.isUpdatePressed = localStorage.getItem('isUpdatePressedMessages'  + this.groupId) === '1';
    if (this.messegerService.isUpdatePressed) {
      this.calcCounter();
    }
    this.messegerService.groupId = this.groupId;

    if (!this.specificGroup) {
      this.goBack();
    }
    this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  goBack(): void {
    this.router.navigate([""]);
  }

  update(since?: number) {
    this.messegerService.startTimer();
    this.isLoading = true;
    this.messegerService.getMessages(this.groupId, since).subscribe((result: any) => {
      this.isLoading = false;
      if (since) {
        this.sortMessages([...this.messages, ...result.Items]);
      } else {
        this.sortMessages(result.Items);
      }
      localStorage.setItem('messages' + this.groupId, JSON.stringify(this.messages ?? ''))
    }, e => {
      this.openSnackBar(e?.error?.message ?? "Something went wrong");
      this.isLoading = false;
    })
  }

  getUserName(message: any): string {
    return (this.peopleList.Items.find((u: any) => u.uid.S === message?.authorID?.S))?.name?.S ?? '';
  }

  private sortMessages(messages: any) {
    this.messages = messages.sort((a: any, b: any) => {
      return a.createdAt.S - b.createdAt.S
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
    event.stopPropagation();
    if (this.message?.value?.trim()) {
      this.isLoading = true;
      this.messegerService.addMessage(this.groupId, this.message.value).subscribe(result => {
        this.isLoading = false;
        if (this.messages?.length === 0) {
          this.update();
        }
        if (this.messages[this.messages?.length - 1]?.createdAt.S) {
          this.update(this.messages[this.messages.length - 1].createdAt.S)
        } else {
          this.update();
        }
      }, e => {
        this.openSnackBar(e?.error?.message ?? "Something went wrong");
        this.isLoading = false;
      })
      this.message.setValue('');
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close');
  }

  isMyMessage(message: any): boolean {
    return message.authorID.S === this.user.uid;
  }

  isMyGroup(): boolean {
    return this.specificGroup.createdBy.S === this.user.uid;
  }

  deleteGroup() {
    if (localStorage.getItem('theme')) {
      this.isDark = JSON.parse(localStorage.getItem('theme') ?? '');
    }
    
    const dialogRef = this.dialog.open(SecPersonDialog, {
      data: { groupId: this.specificGroup.id.S, name: this.specificGroup.name.S },
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
        this.groupService.deleteGroup(this.specificGroup.id.S).subscribe(r => {
          this.isLoading = false;
          this.groupsList.Items = this.groupsList.Items.filter((i: any) => i.id.S !== this.specificGroup.id.S);
          localStorage.setItem('groupsList', JSON.stringify(this.groupsList));
          dialogRef.close();
          this.openSnackBar("Group chat has removed");
          this.router.navigate(['']);
        }, e => {
          this.openSnackBar(e?.error?.message ?? "Something went wrong");
          this.isLoading = false;
        })
      }
    )
  }

  private calcCounter() {
    const startCounterTime: number = +(localStorage.getItem('startCounterTimeMessages' + this.groupId) ?? '');
    const nowCounterTime: number = Math.round(Date.now() / 1000);

    const diff = 60 - (nowCounterTime - startCounterTime);

    if (diff >= 0 && diff <= 60) {
      this.messegerService.counter = diff;
      this.messegerService.isUpdatePressed = localStorage.getItem('isUpdatePressedMessages' + this.groupId) === '1';
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
