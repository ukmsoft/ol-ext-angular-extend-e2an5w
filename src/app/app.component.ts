import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { MapdataService } from './map/mapdata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ol-ext-angular';
  geoObj: string;

  constructor (private mapdataService: MapdataService){}
  ngOnInit(){
    this.mapdataService.dataChanged
    .subscribe({
      next: (v) =>{ 
        console.log(`Geo Changed: ${v}`);
        this.geoObj = v.toString();
      }
      
});
  }

}
