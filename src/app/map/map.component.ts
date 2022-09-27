import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

import OlMap from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { MapService } from './map.service';
import { MapidService } from './mapid.service';
import { Subject } from 'rxjs';
import { MapdataService } from './mapdata.service';


/**
 * Map Component: load and display a map
 * @example
 * <app-map id="map"></app-map>
 */
@Component({
  selector: 'app-map',
  template: '',
  // Include ol style as global
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    'ol.css',
    'ol-ext.css'
  ],
  providers: [MapidService]
})

export class MapComponent implements OnInit {

  /** Map id
   */
  @Input() id: string;

  /** Longitude of the map
   */
  @Input() lon: string;

  /** Latitude of the map
   */
  @Input() lat: string;

  /** Zoom of the map
   */
  @Input() zoom: string;




  /**
   * [ol.Map](http://openlayers.org/en/latest/apidoc/ol.Map.html) Openlayer map object
   */
  map: OlMap;


  constructor(
    private mapService: MapService,
    private mapidService: MapidService,
    private mapdataService: MapdataService,
    private elementRef: ElementRef
  ) {}

  /**
   * Create map on Init
   */
  ngOnInit() {
    // Register a new id in the Mapid Service
    this.mapidService.setId(this.id);
    // Create a new map
    this.map = this.mapService.getMap(this.id);
    // If id is not defined place the map in the component element itself
    if (!this.id) {
      this.id = 'map';
      this.map.setTarget(this.elementRef.nativeElement);
    }
    // Center on attribute
    this.map.getView().setCenter(fromLonLat([parseFloat(this.lon) || 0, parseFloat(this.lat) || 0]));
    this.map.getView().setZoom(this.zoom);

    this.geoChanged('Map init');
  }


  geoChanged(geo){
    this.mapdataService.updateData(geo);
  }
}
