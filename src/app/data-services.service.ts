import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataServicesService {

  constructor(private http: HttpClient) { }
  saveServices(userId, services) {
    console.log(userId, services)
    return this.http.post(`/services/${services.userId}`, services)
  }
}
