import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablePanelComponent } from './table-panel/table-panel.component';

const routes: Routes = [
  { path: '', component: TablePanelComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TablesRoutingModule { }
