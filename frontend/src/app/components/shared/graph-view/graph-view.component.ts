import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MiniMapPosition} from "@swimlane/ngx-graph";
import {GraphLinkDto, GraphNodeDto} from "../../../dtos";

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrl: './graph-view.component.scss'
})
export class GraphViewComponent {

    onNodeSelect(event: any): void {
        this.selectedNodeChange.emit(event);
    }

    @Input() nodes: GraphNodeDto[] = [];

    @Input() links: GraphLinkDto[] = [];

    @Output() selectedNodeChange: EventEmitter<GraphNodeDto> = new EventEmitter<GraphNodeDto>();

    protected readonly MiniMapPosition = MiniMapPosition;
}
