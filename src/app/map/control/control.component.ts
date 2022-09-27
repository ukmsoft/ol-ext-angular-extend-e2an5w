import { Component, Input, ElementRef, OnInit, Host, Optional } from '@angular/core';

import { MapService } from '../map.service';
import { MapidService } from '../mapid.service';
import OlMap from 'ol/Map';
import BookmarkCtrl from 'ol-ext/control/GeoBookmark';
import EditBar from 'ol-ext/control/EditBar';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Popup from 'ol-ext/overlay/Popup';
import ol_layer_Vector from 'ol/layer/Vector';
import ol_source_Vector from 'ol/source/Vector';
import olext_control_Button from 'ol-ext/control/Button';
import {getLength as ol_sphere_getLength} from 'ol/sphere';
import {getDistance as ol_sphere_getDistance} from 'ol/sphere';
import {transform as ol_proj_transform} from 'ol/proj';
import { MapdataService } from '../mapdata.service';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * Add a control to the map
 * The control can be set inside the map (using parent id) or outside (using a mapId attribute)
 * @example
  <!-- Display a control inside a map -->
  <app-map>
    <app-control></app-control>
  </app-map>

  <!-- Display a control outside a map -->
  <app-control mapId="map"></app-control>
 */
@Component({
  selector: 'app-control',
  template: ''
})

export class ControlComponent implements OnInit {

  /** Map id
   */
  @Input() mapId: string;

  /** Define the service
   */
  constructor(
    private mapService: MapService,
    @Host()
    @Optional()
    private mapidService: MapidService,
    private mapdataService: MapdataService,
    private elementRef: ElementRef
  ) { }

  /** Add the control to the map
   */
  ngOnInit() {
    // Get the current map or get map by id
    const map: OlMap = this.mapService.getMap(this.mapidService || this.mapId);


    // Get the mapdataService
    const mapdataService: MapdataService = this.mapdataService;



    // Get the target if outside the map
    const target = this.elementRef.nativeElement.parentElement ? this.elementRef.nativeElement : null;
    
    
    
    
    // Create the control
    const mark = new BookmarkCtrl({ target: target });
    map.addControl(mark);




    //  Vector layer
    var vector = new ol_layer_Vector( { source: new ol_source_Vector() })
    map.addLayer(vector);



  // Vector callback
    vector.on('change', function(e){
    console.log('VECTOR change',e);
    console.log('VECTOR change - features',vector.getSource().getFeatures());
    const geoJsonValue = new GeoJSON().writeFeatures(vector.getSource().getFeatures());
    mapdataService.updateData(geoJsonValue);
    });



		// Add a save button with on active event
		
    var save = new olext_control_Button (
				{	html: '<i class="fa fa-download"></i>',
					className: "save",
					title: "Save",
					handleClick: function(e)
					{	
            console.log("Save click",e);
            console.log("Vector features",vector.getSource().getFeatures());

					}
				});
		map.addControl ( save );
  


  // Add the editbar
  var edit = new EditBar({ source: vector.getSource() });
  map.addControl(edit);

  // Add a tooltip
  var tooltip = new Tooltip();
  map.addOverlay(tooltip);

  edit.getInteraction('Select').on('select', function(e){
    if (this.getFeatures().getLength()) {
      tooltip.setInfo('Drag points on features to edit...');
    }
    else tooltip.setInfo();
  });
  edit.getInteraction('Select').on('change:active', function(e){
    tooltip.setInfo('');
  });
  edit.getInteraction('ModifySelect').on('modifystart', function(e){
    if (e.features.length===1) tooltip.setFeature(e.features[0]);
  });
  edit.getInteraction('ModifySelect').on('modifyend', function(e){
    tooltip.setFeature();
  });
  edit.getInteraction('DrawPoint').on('change:active', function(e){
    tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
  });
  edit.getInteraction('DrawLine').on(['change:active','drawend'], function(e){
    tooltip.setFeature();
    tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
  });
  edit.getInteraction('DrawLine').on('drawstart', function(e){
    tooltip.setFeature(e.feature);
    tooltip.setInfo('Click to continue drawing line...');
  });



// ######################## CHanges here

  /*edit.getInteraction('DrawPolygon').on('drawstart', function(e){
    tooltip.setFeature(e.feature);
    tooltip.setInfo('Click to continue drawing shape...');
  }); */


  edit.getInteraction('DrawPolygon').on('drawstart', function(e){
    console.log('CHANGE Draw shape',e);
    tooltip.setFeature(e.feature);
    e.feature.getGeometry().on('change', (e) => {calculateMeasure(e, edit.getMap(), tooltip)});
    tooltip.setInfo('Click to continue drawing shape...');
    });





  edit.getInteraction('DrawPolygon').on(['change:active'], function(e){
    tooltip.setFeature();
    tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
  });

  edit.getInteraction('DrawPolygon').on(['drawend'], function(e){
    tooltip.setFeature();
    tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');

 
    console.log('DrawPolygon end',e.feature.getGeometry().getCoordinates());
    console.log('DrawPolygon end e',e);
    console.log('DrawPolygon map',this.map);
    console.log('DrawPolygon - Vector features',vector.getSource().getFeatures());


    // this.mapdataService.updateData("Map changed");
  });

  edit.getInteraction('DrawHole').on('drawstart', function(e){
    tooltip.setFeature(e.feature);
    tooltip.setInfo('Click to continue drawing hole...');
  });
  edit.getInteraction('DrawHole').on(['change:active','drawend'], function(e){
    tooltip.setFeature();
    tooltip.setInfo(e.oldValue ? '' : 'Click polygon to start drawing hole...');
  });
  edit.getInteraction('DrawRegular').on('drawstart', function(e){
    tooltip.setFeature(e.feature);
    tooltip.setInfo('Move and click map to finish drawing...');
  });
  edit.getInteraction('DrawRegular').on(['change:active','drawend'], function(e){
    tooltip.setFeature();
    tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
  });



    let calculateMeasure = (e, map,tooltip ) => {
      // function calculateMeasure(e) {
        console.log('CalculateMeasure',e, map, tooltip);
        var geom = e.target;
        var proj = map.getView().getProjection();
        console.log('Projection',proj);
        // var totalLength = 99;
        var totalLength = tooltip.formatLength(ol_sphere_getLength(geom, { projection: proj }));
        // Last segment length
        var g = geom.getCoordinates()[0];
        var l = g.length-2;
        var p0 = ol_proj_transform(g[l], proj, 'EPSG:4326')
        var p1 = ol_proj_transform(g[l-1], proj, 'EPSG:4326')
        // measure
        var length = totalLength +' - '+ tooltip.formatLength(ol_sphere_getDistance(p0,p1));
        var measure = tooltip.get('measure');
        tooltip.set('measure', (measure ? measure+' - ':'') + length)
      }

  }



}
