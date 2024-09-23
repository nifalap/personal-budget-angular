import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private budgetData: Array<{ title: string; budget: number }> = [];

  constructor(private http: HttpClient) {}

  fetchData(): Observable<{ myBudget: Array<{ title: string; budget: number }> }> {
    return this.http.get<{ myBudget: Array<{ title: string; budget: number }> }>('http://localhost:3000/budget')
      .pipe(
        tap((res: any) => {
          this.budgetData = res.myBudget;  // Populate the service variable with data
        })
      );
  }

  getBudgetData(): Array<{ title: string; budget: number }> {
    return this.budgetData;
  }
}
