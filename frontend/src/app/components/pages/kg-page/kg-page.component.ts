import {Component, OnInit} from '@angular/core';
import {MiniMapPosition} from "@swimlane/ngx-graph";
import {GraphService} from "../../../services/graph.service";
import {ToastService} from "../../../services";
import {GraphLinkDto, GraphNodeDto} from "../../../dtos";

@Component({
    selector: 'app-kg-page',
    templateUrl: './kg-page.component.html',
    styleUrl: './kg-page.component.scss'
})
export class KgPageComponent implements OnInit {

    graphIsReady: boolean = false;
    loading: boolean = true;

    constructor(private graphService: GraphService, private toastService: ToastService) {}

    ngOnInit(): void {
        this.loading = true;
        this.graphService.getIsGraphReady().subscribe({
            next: (isReady: boolean) => {
                console.log('Graph is ready:', isReady);
                if (isReady) {
                    this.graphService.getFullGraph().subscribe({
                        next: (graphData: any) => {
                            this.nodes = graphData.nodes;
                            this.links = graphData.links;

                            this.loading = false;

                            this.graphIsReady = true;
                        },
                        error: (error: any) => {
                            this.toastService.showErrorResponse(error);
                            this.loading = false;
                        }
                    });
                } else {
                    this.graphIsReady = false;
                    this.loading = false;
                }
            },
            error: (error: any) => {
                this.toastService.showErrorResponse(error);
                this.loading = false;
            }
        });
    }

    updatedSelectedNode(event: GraphNodeDto): void {
        this.selectedNode = event;
        console.log('Selected node updated:', this.selectedNode);
    }

    nodes: GraphNodeDto[] = [];

    links: GraphLinkDto[] = [];

    selectedNode: GraphNodeDto | null = null;
}
