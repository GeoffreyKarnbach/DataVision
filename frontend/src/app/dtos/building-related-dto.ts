import { ThingDto } from "./thing-dto";

export interface BuildingDto {
  name: string;
  floors: FloorDto[];
}

export interface FloorDto {
  name: string;
  rooms: RoomDto[];
}

export interface RoomDto {
  name: string;
  things: ThingDto[];
}
