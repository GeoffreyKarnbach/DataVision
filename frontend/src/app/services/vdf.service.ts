import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Globals} from "src/app/global";
import {Observable} from "rxjs";

@Injectable({
    providedIn: "root",
})
export class VdfService {
    private virtualDataFabricUri: string =
        this.globals.virtualDataFabricUri + "/virtual-data-fabric";

    constructor(private httpClient: HttpClient, private globals: Globals) {
    }
    
    buildVirtualDataFabric(): Observable<void> {
        return this.httpClient.post<void>(
            `${this.virtualDataFabricUri}/build`,
            null
        );
    }

    resetVirtualDataFabric(): Observable<void> {
        return this.httpClient.post<void>(
            `${this.virtualDataFabricUri}/reset`,
            null
        );
    }

    statusVirtualDataFabric(): Observable<boolean> {
        return this.httpClient.get<boolean>(`${this.virtualDataFabricUri}/status`);
    }

    isReadyToBuildVirtualDataFabric(): Observable<boolean> {
        return this.httpClient.get<boolean>(
            `${this.virtualDataFabricUri}/ready-to-build`
        );
    }
}
