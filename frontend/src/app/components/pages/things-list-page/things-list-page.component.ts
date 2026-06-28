import {Component, OnInit} from "@angular/core";
import { ThingDto } from "src/app/dtos/thing-dto";
import { UnsService } from "src/app/services";

@Component({
  selector: "app-things-list-page",
  templateUrl: "./things-list-page.component.html",
  styleUrl: "./things-list-page.component.scss",
})
export class ThingsListPageComponent implements OnInit{
  tdLink: string = "";
  topicName: string = "";
  hiveMQUrl: string = "mqtt://hivemq:1883";
  things: ThingDto[] = [];
  isLoading: boolean = false;

  constructor(private unsService: UnsService) {}

  ngOnInit(): void {
    this.loadThings();
  }

  loadThings(): void {
    this.isLoading = true;
    this.unsService.getAllThings().subscribe((data) => {
      this.things = data;
      this.isLoading = false;
    });
  }

  addThing(): void {
    if (!this.tdLink.trim() || !this.topicName.trim()) return;

    const newThing: ThingDto = {
      tdLink: this.tdLink.trim(),
      topicName: this.topicName.trim(),
      hiveMqBrokerUrl: this.hiveMQUrl.trim(),
    };

    this.unsService.addThing(newThing).subscribe((thing) => {
      this.tdLink = "";
      this.topicName = "";
      this.loadThings();
    });
  }

  removeThing(thing: ThingDto): void {
    this.unsService.removeThing(thing).subscribe(() => {
      this.loadThings();
    });
  }
}
