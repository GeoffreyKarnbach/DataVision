import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class Globals {
  readonly unsBaseUri: string = this.findUnsUrl();
  readonly virtualDataFabricUri: string = this.findVirtualDataFabricUrl();
  readonly graphServiceUri: string = this.findGraphServiceUrl();
  readonly plottingServiceUri: string = this.findPlottingServiceUrl();

  private findUnsUrl(): string {
    return "http://localhost:5001/";
  }

  private findVirtualDataFabricUrl(): string {
    return "http://localhost:5100/";
  }

  private findGraphServiceUrl(): string {
    return "http://localhost:5200/";
  }

  private findPlottingServiceUrl(): string {
    return "http://localhost:5300/";
  }
}
