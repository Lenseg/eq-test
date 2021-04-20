import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataServicesService {
  url = 'http://127.0.0.1:4433';
  constructor(private http: HttpClient) { }

  getServices() {
    return this.http.get(this.url + `/services/types`)
  }
  getTransactions() {
    return this.http.get(this.url + `/transactions`)
  }
  createTransactions(transactions) {
    return this.http.post(this.url + `/transactions`, transactions)
  }
}
