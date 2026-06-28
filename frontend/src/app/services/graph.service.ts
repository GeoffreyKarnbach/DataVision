import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Globals} from "src/app/global";
import {Observable} from "rxjs";
import {GraphDto} from "../dtos";

@Injectable({
    providedIn: "root",
})
export class GraphService {
    private graphServiceUri: string = this.globals.graphServiceUri + "/graph-service";

    constructor(private httpClient: HttpClient, private globals: Globals) {
    }
    
    getFullGraph(): Observable<GraphDto> {
        return this.httpClient.get<GraphDto>(
            `${this.graphServiceUri}/graph`
        );
    }

    getIsGraphReady(): Observable<boolean> {
        return this.httpClient.get<boolean>(
            `${this.graphServiceUri}/ready`
        );
    }

}
