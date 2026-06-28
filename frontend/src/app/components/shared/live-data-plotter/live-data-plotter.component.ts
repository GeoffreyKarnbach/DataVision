import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { GraphNodeDto, MetricMapDto } from "src/app/dtos";
import { PlottingService } from "src/app/services";
import { Subscription, interval, startWith, switchMap } from "rxjs";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: "app-live-data-plotter",
  templateUrl: "./live-data-plotter.component.html",
  styleUrls: ["./live-data-plotter.component.scss"],
})
export class LiveDataPlotterComponent implements OnChanges, OnDestroy {
  @Input() selectedNode: GraphNodeDto | null = null;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private pollingSubscription: Subscription | null = null;
  private readonly MAX_DATA_POINTS = 30;

  public lineChartData: ChartConfiguration["data"] | null = null;
  public lineChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 250,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };
  public lineChartType: ChartType = "line";

  constructor(private plottingService: PlottingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedNode"]) {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.lineChartData = null;

    const node = this.selectedNode;
    if (!node) return;

    const type = node.type;
    switch (type) {
      case "Building":
        this.pollEvery3s(() => this.plottingService.getFullBuildingData());
        break;
      case "Floor":
        const floorName = this.extractAttribute(node, "name:");
        if (floorName) {
          this.pollEvery3s(() => this.plottingService.getFloorData(floorName));
        }
        break;
      case "Room":
        const roomName = this.extractAttribute(node, "name:");
        if (roomName) {
          this.pollEvery3s(() => this.plottingService.getRoomData(roomName));
        }
        break;
      case "Thing":
        const topicName = this.extractAttribute(node, "topicName:");
        if (topicName) {
          this.pollEvery3s(() => this.plottingService.getThingData(topicName));
        }
        break;
      case "ThingType":
        const thingType = this.extractThingTypeFromLabel(node.label || "");
        if (thingType) {
          this.pollEvery3s(() =>
            this.plottingService.getThingTypeData(thingType)
          );
        }
        break;
      default:
        this.lineChartData = null;
    }
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  private pollEvery3s(
    requestFn: () => import("rxjs").Observable<MetricMapDto | null>
  ): void {
    this.pollingSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => requestFn())
      )
      .subscribe((data: MetricMapDto | null) => {
        if (data) {
          this.updateChartData(data);
        }
      });
  }

  private updateChartData(newData: MetricMapDto): void {
    const timestamp = new Date().toLocaleTimeString();

    // CASE 1: Chart is not yet initialized
    if (!this.lineChartData) {
      const datasets = Object.keys(newData).map((key) => ({
        data: [newData[key]],
        label: key,
        fill: false,
        tension: 0.2,
      }));
      this.lineChartData = {
        labels: [timestamp],
        datasets: datasets,
      };
      return;
    }

    // CASE 2: Chart is already initialized, update it
    this.lineChartData.labels?.push(timestamp);

    this.lineChartData.datasets.forEach((dataset) => {
      const newValue = newData[dataset.label || ""];
      if (newValue !== undefined) {
        dataset.data.push(newValue);
      }
      if (dataset.data.length > this.MAX_DATA_POINTS) {
        dataset.data.shift(); // Remove the oldest data point
      }
    });

    if (
      this.lineChartData.labels &&
      this.lineChartData.labels.length > this.MAX_DATA_POINTS
    ) {
      this.lineChartData.labels.shift();
    }

    this.chart?.update(); // Trigger a chart update
  }

  private extractAttribute(node: GraphNodeDto, prefix: string): string | null {
    return (
      node.attributes
        ?.find((attr) => attr.startsWith(prefix))
        ?.substring(prefix.length)
        .trim() || null
    );
  }

  private extractThingTypeFromLabel(label: string): string | null {
    if (label.startsWith("ThingType:")) {
      return label.substring("ThingType:".length).trim();
    }
    return null;
  }
}
