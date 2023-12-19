import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/login/login.model';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  isUpdatePressed: boolean = false;
  counter: number = 60;

  constructor(private http: HttpClient) { }

  readonly listPeopleUrl = 'https://tasks.app.rs.school/angular/users';
  readonly listConversationsUrl = 'https://tasks.app.rs.school/angular/conversations/list';
  readonly createConversationUrl = 'https://tasks.app.rs.school/angular/conversations/create'

  public getPeopleList(): Observable<any> {
    const headers = this.headers();
    return this.http.get(this.listPeopleUrl, { headers });
  }

  public getConversationsList(): Observable<any> {
    const headers = this.headers();
    return this.http.get(this.listConversationsUrl, { headers });
  }

  public createConversation(companion: string): Observable<any> {
    const headers = this.headers();
    return this.http.post(this.createConversationUrl, { companion }, { headers });
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
      localStorage.setItem('startCounterTimePeople', startCounterTime);
      localStorage.setItem('isUpdatePressedPeople', '1');
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
        localStorage.setItem('isUpdatePressedPeople', '0');
      }
    }, timer);
  }
}
