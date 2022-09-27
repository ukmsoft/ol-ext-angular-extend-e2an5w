import { NgModule } from '@angular/core';

import { MapService } from './map.service';

import { MapComponent } from './map.component';
import { LayerComponent } from './layer/layer.component';
import { ControlComponent } from './control/control.component';
import { MousePositionComponent } from './control/mouse-position.component';
import { InteractionComponent } from './interaction/interaction.component';
import { DisplayGeoComponent } from './display/display-geo/display-geo.component';
import { MapidService } from './mapid.service';
import { MapdataService } from './mapdata.service';

@NgModule({
  declarations: [
    MapComponent,
    LayerComponent,
    ControlComponent,
    MousePositionComponent,
    InteractionComponent,
    DisplayGeoComponent
  ],
  imports: [],
  providers: [
    MapService,
    MapidService,
    MapdataService
  ],
  exports: [
    MapComponent,
    LayerComponent,
    ControlComponent,
    MousePositionComponent,
    InteractionComponent,
    DisplayGeoComponent
  ]
})
export class MapModule { }
