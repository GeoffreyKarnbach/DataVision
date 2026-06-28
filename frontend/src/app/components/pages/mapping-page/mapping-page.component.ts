import { Component, OnInit } from "@angular/core";
import { BuildingDto } from "src/app/dtos/building-related-dto";
import { ThingDto } from "src/app/dtos/thing-dto";
import { UnsService, ToastService } from "src/app/services";

@Component({
  selector: "app-mapping-page",
  templateUrl: "./mapping-page.component.html",
  styleUrl: "./mapping-page.component.scss",
})
export class MappingPageComponent implements OnInit {
  constructor(
    private unsService: UnsService,
    private toastService: ToastService
  ) {}

  building: BuildingDto = {
    name: "Main Building",
    floors: [],
  };

  newFloorName = "";
  newRoomNameMap: { [key: number]: string } = {};
  newThingNameMap: { [key: string]: string } = {};

  editingFloors: Set<number> = new Set();
  editingRooms: Set<string> = new Set();
  editingThings: Set<string> = new Set();

  floorEditNames: { [key: number]: string } = {};
  roomEditNames: { [key: string]: string } = {};
  thingEditNames: { [key: string]: string } = {};

  selectedThingMap: { [key: string]: string } = {};

  allThings: ThingDto[] = [];
  usedThingLinks = new Set<string>();

  ngOnInit(): void {
    this.unsService.getAllThings().subscribe((things) => {
      this.allThings = things;
    });

    this.unsService.getBuildingModel().subscribe((building) => {
      this.building = building;
      this.building.floors.forEach((floor, fIdx) => {
        floor.rooms.forEach((room, rIdx) => {
          room.things.forEach((thing) => {
            this.markThingUsed(thing.tdLink);
            this.selectedThingMap[`${fIdx}_${rIdx}`] = thing.tdLink;
          });
        });
      });
    });
  }

  addFloor() {
    if (this.newFloorName.trim()) {
      this.building.floors.push({ name: this.newFloorName.trim(), rooms: [] });
      this.newFloorName = "";
    }
  }

  deleteFloor(index: number) {
    const floor = this.building.floors[index];
    floor.rooms.forEach((room) =>
      room.things.forEach((t) => this.markThingUnused(t.tdLink))
    );
    this.building.floors.splice(index, 1);
  }

  startEditFloor(index: number, name: string) {
    this.editingFloors.add(index);
    this.floorEditNames[index] = name;
  }

  saveFloorEdit(index: number) {
    this.building.floors[index].name = this.floorEditNames[index];
    this.editingFloors.delete(index);
  }

  cancelFloorEdit(index: number) {
    this.editingFloors.delete(index);
  }

  addRoom(floorIndex: number) {
    const name = this.newRoomNameMap[floorIndex]?.trim();
    if (name) {
      this.building.floors[floorIndex].rooms.push({ name, things: [] });
      this.newRoomNameMap[floorIndex] = "";
    }
  }

  deleteRoom(fIdx: number, rIdx: number) {
    this.building.floors[fIdx].rooms[rIdx].things.forEach((t) =>
      this.markThingUnused(t.tdLink)
    );
    this.building.floors[fIdx].rooms.splice(rIdx, 1);
  }

  startEditRoom(fIdx: number, rIdx: number, name: string) {
    const key = `${fIdx}_${rIdx}`;
    this.editingRooms.add(key);
    this.roomEditNames[key] = name;
  }

  saveRoomEdit(fIdx: number, rIdx: number) {
    const key = `${fIdx}_${rIdx}`;
    this.building.floors[fIdx].rooms[rIdx].name = this.roomEditNames[key];
    this.editingRooms.delete(key);
  }

  cancelRoomEdit(fIdx: number, rIdx: number) {
    this.editingRooms.delete(`${fIdx}_${rIdx}`);
  }

  getAvailableThings(): ThingDto[] {
    return this.allThings.filter((t) => !this.usedThingLinks.has(t.tdLink));
  }

  markThingUsed(tdLink: string) {
    this.usedThingLinks.add(tdLink);
  }

  markThingUnused(tdLink: string) {
    this.usedThingLinks.delete(tdLink);
  }

  addThingToRoom(fIdx: number, rIdx: number) {
    const key = `${fIdx}_${rIdx}`;
    const tdLink = this.selectedThingMap[key];
    if (tdLink) {
      const thing = this.allThings.find((t) => t.tdLink === tdLink);
      if (thing) {
        this.building.floors[fIdx].rooms[rIdx].things.push(thing);
        this.markThingUsed(thing.tdLink);
        this.selectedThingMap[key] = "";
      }
    }
  }

  removeThing(fIdx: number, rIdx: number, tIdx: number) {
    const removed = this.building.floors[fIdx].rooms[rIdx].things.splice(
      tIdx,
      1
    )[0];
    if (removed) this.markThingUnused(removed.tdLink);
  }

  saveMapping() {
    this.unsService.saveBuildingModel(this.building).subscribe(
      (response) => {
        console.log("Building model saved successfully:", response);
        this.toastService.showSuccess(
          "Building model saved successfully!",
          "Success"
        );
      },
      (error) => {
        console.error("Error saving building model:", error);
      }
    );
  }
}
