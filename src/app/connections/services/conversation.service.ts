import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/login/login.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  isUpdatePressed: boolean = false;
  counter: number = 60;
  messagesList: any;
  conversationId!: string;

  readonly baseUrl = 'https://tasks.app.rs.school/angular/conversations';
  readonly addMessageUrl = 'https://tasks.app.rs.school/angular/conversations/append';

  constructor(private http: HttpClient) { }

  public getConversation(conversationID: string, since?: number) {
    const headers = this.headers();
    return this.http.get(this.getConversationUrl(conversationID, since), { headers });
  }

  public addMessage(conversationID: string, message: string) {
    const headers = this.headers();
    return this.http.post(this.addMessageUrl, { conversationID, message }, { headers })
  }

  public deleteConversation(conversationID: string) {
    const headers = this.headers();
    return this.http.delete(this.getDeleteConversationUrl(conversationID), { headers });
  }

  private getConversationUrl(conversationID: string, since?: number) {
    const s = since ? `&since=${since}` : '';
    return `${this.baseUrl}/read?conversationID=${conversationID}${s}`;
  }

  private getDeleteConversationUrl(conversationID: string) {
    return `${this.baseUrl}/delete?conversationID=${conversationID}`;
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
    if (this.isUpdatePressed && !counter && !this.conversationId) {
      return;
    }
    if (counter !== undefined) {
      this.counter = counter;
    } else {
      this.isUpdatePressed = true;
      const startCounterTime = (Math.round(Date.now() / 1000)).toString();
      localStorage.setItem('startCounterTimeConversation' + this.conversationId, startCounterTime);
      localStorage.setItem('isUpdatePressedConversation' + this.conversationId, '1');
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
        localStorage.setItem('isUpdatePressedConversation' + this.conversationId, '0');
      }
    }, timer);
  }
}
