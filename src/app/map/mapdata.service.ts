import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class MapdataService {
  dataChanged = new Subject<string>();

  constructor() { }

  updateData(data: string) {
    this.dataChanged.next(data);
  }


}
