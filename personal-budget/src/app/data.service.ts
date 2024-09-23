import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public newDataSource: any = [];

  private dataSource: any = [];

  private apiUrl:string = "http://localhost:3000/budget";

  fetchDataFromBackend() {
    return this.http.get<any[]>(this.apiUrl);
  }

  setDataSource(data: any[]): void {
    this.dataSource = data;
  }

  setNewDataSource(data: any[]): void {
    this.newDataSource = data;
  }

  getDataSource(): any[] {
    return this.dataSource;
  }

  getNewDataSource():any[]{
    return this.newDataSource;
  }

  constructor(private http: HttpClient) {
  }
}
