import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationBoxComponent } from "../components";
import { NodeScriptDto } from "../dtos";
import { RedNodeScriptNodeBoxComponent } from "../components/shared/red-node-script-node-box/red-node-script-node-box.component";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

  public confirm(
    title: string,
    message: string,
    btnOkText: string = "Ok",
    btnCancelText: string = "Cancel",
    dialogSize: "sm" | "lg" = "lg"
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationBoxComponent, {
      size: dialogSize,
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    return modalRef.result;
  }

  public openScriptEditor(
    nodeId: string,
    nodeName: string,
    nodeScriptDto: NodeScriptDto,
    dialogSize: "sm" | "lg" | "xl" = "lg"
  ): Promise<NodeScriptDto> {
    const modalRef = this.modalService.open(RedNodeScriptNodeBoxComponent, {
      size: dialogSize,
      backdrop: "static",
      keyboard: false,
    });

    modalRef.componentInstance.nodeId = nodeId;
    modalRef.componentInstance.nodeName = nodeName;
    modalRef.componentInstance.nodeScriptDto = nodeScriptDto;

    return modalRef.result;
  }
}
