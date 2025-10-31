import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Http {
  baseUrl = 'https://vouchers-api.infosharesystems.io';

  constructor(private http: HttpClient) {}
  public login(payload: any) {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/json;charset=utf-8'
    );
    return this.http.post<any>(
      this.baseUrl.concat('/vres/auth/vendor-login'),
      payload,
      { headers: headers }
    );
  }
}
