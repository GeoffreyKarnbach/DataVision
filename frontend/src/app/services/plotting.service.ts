import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Globals } from "src/app/global";
import { Observable } from "rxjs";
import { MetricMapDto } from "../dtos";

@Injectable({
  providedIn: "root",
})
export class PlottingService {
  private plottingServiceUri: string =
    this.globals.plottingServiceUri + "/plotting-service";

  constructor(private httpClient: HttpClient, private globals: Globals) {}

  getFullBuildingData(): Observable<MetricMapDto> {
    return this.httpClient.get<MetricMapDto>(`${this.plottingServiceUri}/data`);
  }

  getFloorData(floorName: string): Observable<MetricMapDto> {
    return this.httpClient.get<MetricMapDto>(
      `${this.plottingServiceUri}/data/floor?floor_name=${floorName}`
    );
  }

  getRoomData(roomName: string): Observable<MetricMapDto> {
    return this.httpClient.get<MetricMapDto>(
      `${this.plottingServiceUri}/data/room?room_name=${roomName}`
    );
  }

  getThingData(topicName: string): Observable<MetricMapDto> {
    return this.httpClient.get<MetricMapDto>(
      `${this.plottingServiceUri}/data/thing?topic_name=${topicName}`
    );
  }

  getThingTypeData(thingType: string): Observable<MetricMapDto> {
    return this.httpClient.get<MetricMapDto>(
      `${this.plottingServiceUri}/data/type?type_name=${thingType}`
    );
  }
}
