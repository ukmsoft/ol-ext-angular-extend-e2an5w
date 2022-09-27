import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-geo',
  templateUrl: './display-geo.component.html',
  styleUrls: ['./display-geo.component.css']
})
export class DisplayGeoComponent implements OnInit {
  @Input() geoObj: string;

  constructor() { }

  ngOnInit() {
  }

}