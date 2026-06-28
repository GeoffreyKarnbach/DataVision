import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { BaseChartDirective } from "ng2-charts";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { FooterComponent, HeaderComponent, ToastComponent } from "./components";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  StartPageComponent,
  ThingsListPageComponent,
  MappingPageComponent,
  NodeRedManagementPageComponent,
  VirtualDataFabricComponent,
  KgPageComponent,
  ConfirmationBoxComponent,
} from "./components";
import { NgxGraphModule } from "@swimlane/ngx-graph";
import { GraphViewComponent } from "./components/shared/graph-view/graph-view.component";
import { GraphNodeInspectorComponent } from "./components/shared/graph-node-inspector/graph-node-inspector.component";
import { LiveDataPlotterComponent } from "./components/shared/live-data-plotter/live-data-plotter.component";
import { RedNodeScriptNodeBoxComponent } from './components/shared/red-node-script-node-box/red-node-script-node-box.component';

@NgModule({
  declarations: [
    AppComponent,
    StartPageComponent,
    ToastComponent,
    HeaderComponent,
    FooterComponent,
    StartPageComponent,
    ThingsListPageComponent,
    MappingPageComponent,
    NodeRedManagementPageComponent,
    VirtualDataFabricComponent,
    KgPageComponent,
    ConfirmationBoxComponent,
    GraphViewComponent,
    GraphNodeInspectorComponent,
    LiveDataPlotterComponent,
    RedNodeScriptNodeBoxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxGraphModule,
    BaseChartDirective,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  bootstrap: [AppComponent],
})
export class AppModule {}
