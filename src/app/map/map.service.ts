import { Injectable } from '@angular/core';

import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { Style, Icon, Fill, Text, Stroke } from 'ol/style';

/**
 * Openlayers map service to acces maps by id
 * Inject the service in the class that have to use it and access the map with the getMap method.
 * @example
 *
  import { MapService } from '../map.service';
  import OlMap from 'ol/Map';

  constructor(
    private mapService: MapService,
  ) { }
  ngOnInit() {
    // Get the current map
    const map: OlMap = this.mapService.getMap('map');
  }
 */
@Injectable({
  providedIn: 'root',
})
export class MapService {
  /**
   * List of Openlayer map objects [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html)
   */
  private map = {};

  vectorSource: any;
  rp = [];
  features = [];

  constructor() {
    this.rp = this.generateRandomPoints(
      { lat: 7.0785, lng: 51.4614 },
      9999999,
      100
    );
    console.log(this.rp);
  }

  /**
   * Create a map
   * @param id map id
   * @returns [ol.Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html) the map
   */
  private createMap(id): OlMap {
    const map = new OlMap({
      target: id,
      view: new OlView({
        center: [0, 0],
        zoom: 1,
        projection: 'EPSG:3857',
      }),
    });
    return map;
  }

  /**
   * Get a map. If it doesn't exist it will be created.
   * @param id id of the map or an objet with a getId method (from mapid service), default 'map'
   */
  getMap(id): OlMap {
    id = (id && id.getId ? id.getId() : id) || 'map';
    // Create map if not exist
    if (!this.map[id]) {
      this.map[id] = this.createMap(id);
    }
    // return the map
    return this.map[id];
  }

  /** Get all maps
   * NB: to access the complete list of maps you should use the ngAfterViewInit() method to have all maps instanced.
   * @return the list of maps
   */
  getMaps() {
    return this.map;
  }

  /** Get all maps
   * NB: to access the complete list of maps you should use the ngAfterViewInit() method to have all maps instanced.
   * @return array of maps
   */
  getArrayMaps() {
    return Object.values(this.map);
  }

  markerStyle() {
    return new Style({
      image: new Icon({
        src: './assets/img/marker.png',
        scale: (0.3 * 100) / 900,
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        textAlign: 'center',
        textBaseline: 'top',
        text: ' hello every one ',
        offsetY: 5,
      }),
    });
  }

  public olPtsLayer() {
    let features = [];
    this.rp.forEach((element) => {
      var coords = fromLonLat([
        parseFloat(element.lat),
        parseFloat(element.lng),
      ]);
      features.push(
        new Feature({
          geometry: new Point(coords),
        })
      );
    });
    return features;
  }

  generateRandomPoints(center, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(this.generateRandomPoint(center, radius, i));
    }
    return points;
  }

  generateRandomPoint(center, radius, i) {
    const x0 = center.lng;
    const y0 = center.lat;
    const rd = radius / 111300;

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const xp = x / Math.cos(y0);
    return { lat: y + y0, lng: xp + x0, id: i };
  }
}
