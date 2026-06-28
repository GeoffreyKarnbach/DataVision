import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {StartPageComponent} from "./components";
import {ThingsListPageComponent} from "./components";
import {MappingPageComponent} from "./components";
import {
    NodeRedManagementPageComponent
} from "./components";
import {VirtualDataFabricComponent} from "./components";
import {KgPageComponent} from "./components";

const routes: Routes = [
    {path: "", component: StartPageComponent},
    {path: "things-list", component: ThingsListPageComponent},
    {path: "building", component: MappingPageComponent},
    {path: "node-red", component: NodeRedManagementPageComponent},
    {path: "virtual-data-fabric", component: VirtualDataFabricComponent},
    {path: "knowledge-graph", component: KgPageComponent},
    {path: "**", redirectTo: "", pathMatch: "full"},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
