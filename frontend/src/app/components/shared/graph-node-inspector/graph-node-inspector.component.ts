import {Component, Input} from '@angular/core';
import {GraphNodeDto} from "../../../dtos";

@Component({
  selector: 'app-graph-node-inspector',
  templateUrl: './graph-node-inspector.component.html',
  styleUrl: './graph-node-inspector.component.scss'
})
export class GraphNodeInspectorComponent {

  @Input() selectedNode: GraphNodeDto | null = null;

}
