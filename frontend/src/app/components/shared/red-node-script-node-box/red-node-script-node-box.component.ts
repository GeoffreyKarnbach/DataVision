import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NodeScriptDto } from "src/app/dtos";

@Component({
  selector: "app-red-node-script-node-box",
  templateUrl: "./red-node-script-node-box.component.html",
  styleUrl: "./red-node-script-node-box.component.scss",
})
export class RedNodeScriptNodeBoxComponent {
  constructor(private activeModal: NgbActiveModal) {}

  @Input() nodeId: string = "";
  @Input() nodeName: string = "";

  @Input() nodeScriptDto: NodeScriptDto = {
    nodeId: this.nodeId,
    enabled: false,
    scriptContent: "",
  };

  public save() {
    this.activeModal.close(this.nodeScriptDto);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }
}
