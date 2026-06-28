import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services";
import {VdfService} from "../../../services/vdf.service";

@Component({
  selector: "app-virtual-data-fabric",
  templateUrl: "./virtual-data-fabric.component.html",
  styleUrl: "./virtual-data-fabric.component.scss",
})
export class VirtualDataFabricComponent implements OnInit {
  constructor(
    private vdfService: VdfService,
    private toastService: ToastService
  ) {}

  virtualDataFabricRunning: boolean = false;
  loading: boolean = false;

  isReadyToBuild: boolean = false;

  ngOnInit(): void {
    this.vdfService.isReadyToBuildVirtualDataFabric().subscribe({
      next: (status) => {
        this.isReadyToBuild = status;
      },
    });

    this.vdfService.statusVirtualDataFabric().subscribe({
      next: (status) => {
        this.virtualDataFabricRunning = status;
      },
      error: (error) => {
        this.toastService.showError(
          "Error checking Virtual Data Fabric status",
          error
        );
        this.virtualDataFabricRunning = false;
      },
    });
  }

  resetVirtualDataFabric(): void {
    this.loading = true;
    this.vdfService.resetVirtualDataFabric().subscribe({
      next: () => {
        this.toastService.showSuccess(
          "Virtual Data Fabric reset successfully.",
          "Success"
        );
        this.virtualDataFabricRunning = false;
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError(
          "Error resetting Virtual Data Fabric",
          "Error"
        );
        this.loading = false;
      },
    });
  }

  buildVirtualDataFabric(): void {
    this.loading = true;
    this.vdfService.buildVirtualDataFabric().subscribe({
      next: () => {
        this.toastService.showSuccess(
          "Virtual Data Fabric built successfully.",
          "Success"
        );
        this.virtualDataFabricRunning = true;
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError(
          "Error building Virtual Data Fabric",
          "Error"
        );
        this.loading = false;
      },
    });
  }
}
