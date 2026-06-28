import { Component, OnInit } from "@angular/core";
import {
  UnsService,
  ToastService,
  VdfService,
  ModalService,
} from "src/app/services";

@Component({
  selector: "app-node-red-management-page",
  templateUrl: "./node-red-management-page.component.html",
  styleUrl: "./node-red-management-page.component.scss",
})
export class NodeRedManagementPageComponent implements OnInit {
  constructor(
    private unsService: UnsService,
    private vdfService: VdfService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  nodeRedRunning: boolean = false;
  loaded: boolean = false;
  loading: boolean = false;
  loadingMessage: string = "Loading Node-RED status...";
  components: Map<string, string> = new Map<string, string>();

  ngOnInit(): void {
    this.unsService.runningNodeRed().subscribe((isRunning) => {
      if (isRunning) {
        this.nodeRedRunning = true;
        this.loaded = true;
        this.unsService.getNodeRedFlows().subscribe((flows) => {
          this.components = flows;
          this.loading = false;
        });
      } else {
        this.nodeRedRunning = false;
        this.loaded = true;
      }
    });
  }

  generateNodeRed() {
    this.loading = true;
    this.loadingMessage = "Generating Node-RED flow...";
    this.unsService.generateNodeRed().subscribe((response) => {
      this.nodeRedRunning = true;
      this.loading = false;
      this.components = response;
      this.toastService.showSuccess(
        "Node-RED flow generated successfully.",
        "Success"
      );
    });
  }

  resetNodeRed() {
    this.loading = true;
    this.loadingMessage = "Resetting Node-RED...";
    this.vdfService.statusVirtualDataFabric().subscribe((status) => {
      if (status) {
        this.toastService.showError(
          "Virtual Data Fabric is still running. Please stop it before resetting Node-RED.",
          "Error"
        );
        this.loading = false;
        return;
      } else {
        this.unsService.resetNodeRed().subscribe(() => {
          this.nodeRedRunning = false;
          this.loading = false;
          this.toastService.showSuccess(
            "Node-RED has been reset successfully.",
            "Success"
          );
          this.components = new Map<string, string>();
        });
      }
    });
  }

  get componentEntries(): [string, string][] {
    return Array.from(this.components.entries());
  }

  exportToVirtualDataFabric() {
    this.loading = true;
    this.loadingMessage = "Exporting data to Virtual Data Fabric...";
    this.unsService.exportUnsToVirtualDataFabric().subscribe({
      next: () => {
        this.toastService.showSuccess(
          "Data exported to Virtual Data Fabric successfully.",
          "Success"
        );
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError(
          `Failed to export data: ${error.message}`,
          "Error"
        );
        this.loading = false;
      },
    });
  }

  onEditWorkflow(entry: [string, string]) {
    console.log("Edit workflow:", entry);
    const nodeId = entry[1].split("/").pop() || "";

    this.unsService
      .getNodeRedScriptDetails(nodeId)
      .subscribe((nodeScriptDto) => {
        this.modalService
          .openScriptEditor(nodeId, entry[0], nodeScriptDto, "lg")
          .then((result) => {
            result.nodeId = nodeId;
            this.unsService.editNodeRedFlow(result).subscribe({
              next: (response) => {
                this.toastService.showSuccess(
                  "Node-RED flow updated successfully.",
                  "Success"
                );
              },
              error: (error) => {
                this.toastService.showError(
                  `Failed to update Node-RED flow: ${error.message}`,
                  "Error"
                );
              },
            });
          });
      });
  }
}
