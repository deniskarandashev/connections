import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/login/login.model';

@Injectable({
  providedIn: 'root'
})
export class SpecificGroupService {
  isUpdatePressed: boolean = false;
  counter: number = 60;
  groupId!: string;

  constructor(private http: HttpClient) { }

  readonly baseUrl = 'https://tasks.app.rs.school/angular/groups/read';
  readonly listConversationsUrl = 'https://tasks.app.rs.school/angular/conversations/list';
  readonly createConversationUrl = 'https://tasks.app.rs.school/angular/conversations/create'
  readonly addMessageUrl = 'https://tasks.app.rs.school/angular/groups/append';

  public getMessages(groupID: string, since?: number) {
    const headers = this.headers();
    return this.http.get(this.getMessagesUrl(groupID, since), { headers });
  }

  public addMessage(groupID: string, message: string) {
    const headers = this.headers();
    return this.http.post(this.addMessageUrl, { groupID, message }, { headers })
  }

  private getMessagesUrl(groupId: string, since?: number) {
    const s = since ? `&since=${since}` : '';
    return `${this.baseUrl}?groupID=${groupId}${s}`;
  }

  private headers() {
    const user: User = JSON.parse(localStorage.getItem('user') ?? '') ?? {} as User;
    return {
      'Authorization': `Bearer ${user.token}` ?? '',
      'rs-uid': user.uid ?? '',
      'rs-email': user.email ?? ''
    };
  }

  startTimer(counter?: number) {
    if (this.isUpdatePressed && !counter) {
      return;
    }
    if (counter !== undefined) {
      this.counter = counter;
    } else {
      this.isUpdatePressed = true;
      const startCounterTime = (Math.round(Date.now() / 1000)).toString();
      localStorage.setItem('startCounterTimeMessages' + this.groupId, startCounterTime);
      localStorage.setItem('isUpdatePressedMessages' + this.groupId, '1');
    }
    this.interval();
  }

  interval(counter?: number, step = 1) {
    if (counter !== undefined) {
      this.counter = counter;
    }
    let timer = 1000;
    let m = 1;
    if (step === 0.5) {
      timer = 500;
    }
    let intervalId = window.setInterval(() => {
      if (step === 0.5) {
        m += step;
        m = m % 1 === 0 ? 1 : 0.5;
      }
      this.counter = this.counter - (m % 1 === 0 ? 1 : 0);
      if (this.counter <= 0 || !this.isUpdatePressed) {
        clearInterval(intervalId);
        this.isUpdatePressed = false;
        this.counter = 60;
        localStorage.setItem('isUpdatePressedMessages' + this.groupId, '0');
      }
    }, timer);
  }
}
