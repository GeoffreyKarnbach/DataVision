import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Globals } from "src/app/global";
import { map, Observable } from "rxjs";
import { ThingDto, BuildingDto, NodeScriptDto } from "../dtos";

@Injectable({
  providedIn: "root",
})
export class UnsService {
  private unsUri: string = this.globals.unsBaseUri + "/uns";
  private things: ThingDto[] = [];

  constructor(private httpClient: HttpClient, private globals: Globals) {}

  getAllThings(): Observable<ThingDto[]> {
    return this.httpClient.get<ThingDto[]>(`${this.unsUri}/things`);
  }

  addThing(thing: ThingDto): Observable<ThingDto> {
    return this.httpClient.post<ThingDto>(`${this.unsUri}/things`, thing);
  }

  removeThing(thing: ThingDto): Observable<ThingDto> {
    return this.httpClient.delete<ThingDto>(`${this.unsUri}/things`, {
      body: thing,
    });
  }

  getBuildingModel(): Observable<BuildingDto> {
    return this.httpClient.get<BuildingDto>(`${this.unsUri}/building`);
  }

  saveBuildingModel(building: BuildingDto): Observable<BuildingDto> {
    return this.httpClient.post<BuildingDto>(
      `${this.unsUri}/building`,
      building
    );
  }

  generateNodeRed(): Observable<Map<string, string>> {
    return this.httpClient
      .post<{ [key: string]: string }>(`${this.unsUri}/node-red`, null)
      .pipe(map((obj) => new Map<string, string>(Object.entries(obj))));
  }

  runningNodeRed(): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.unsUri}/node-red/running`);
  }

  resetNodeRed(): Observable<void> {
    return this.httpClient.post<void>(`${this.unsUri}/node-red/reset`, null);
  }

  getNodeRedFlows(): Observable<Map<string, string>> {
    return this.httpClient
      .get<{ [key: string]: string }>(`${this.unsUri}/node-red/flows`)
      .pipe(map((obj) => new Map<string, string>(Object.entries(obj))));
  }

  exportUnsToVirtualDataFabric(): Observable<void> {
    return this.httpClient.post<void>(
      `${this.unsUri}/virtual-data-fabric`,
      null
    );
  }

  editNodeRedFlow(nodeScriptDto: NodeScriptDto): Observable<string> {
    return this.httpClient.post<string>(
      `${this.unsUri}/node-red/node-script`,
      nodeScriptDto
    );
  }

  getNodeRedScriptDetails(flowId: string): Observable<NodeScriptDto> {
    return this.httpClient.get<NodeScriptDto>(
      `${this.unsUri}/node-red/node-script?flowId=${flowId}`
    );
  }
}
