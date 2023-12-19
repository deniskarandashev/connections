import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/login/login.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  isUpdatePressed: boolean = false;
  counter: number = 60;

  constructor(private http: HttpClient) { }

  readonly listGroupsUrl = 'https://tasks.app.rs.school/angular/groups/list';
  readonly createGroupUrl = 'https://tasks.app.rs.school/angular/groups/create';
  readonly deleteGroupUrl = 'https://tasks.app.rs.school/angular/groups/delete?groupID='

  public getGroupsList(): Observable<any> {
    const user: User = JSON.parse(localStorage.getItem('user') ?? '') ?? {} as User;
    const headers = this.headers(user);
    return this.http.get(this.listGroupsUrl, { headers });
  }

  public createGroup(name: string): Observable<any> {
    const user: User = JSON.parse(localStorage.getItem('user') ?? '') ?? {} as User;
    const headers = this.headers(user);
    return this.http.post(this.createGroupUrl, {name}, { headers });
  }

  public deleteGroup(groupID: string): Observable<any> {
    const user: User = JSON.parse(localStorage.getItem('user') ?? '') ?? {} as User;
    const headers = this.headers(user);
    const delGroupUrl = `${this.deleteGroupUrl}${groupID}`
    return this.http.delete(delGroupUrl,{ headers });
  }

  private headers(user: User) {
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
      localStorage.setItem('startCounterTime', startCounterTime);
      localStorage.setItem('isUpdatePressed', '1');
    }
    this.interval();
  }

  interval(counter?: number, step = 1) {
    if (counter !== undefined) {
      this.counter = counter;
    }
    let timer = 1000;
    let m = 1;
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
        localStorage.setItem('isUpdatePressed', '0');
      }
    }, timer);
  }
}
