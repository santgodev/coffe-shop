import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';
import { TablePanelComponent } from './table-panel/table-panel.component';
import { TableDialogComponent } from './table-dialog/table-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TablesRoutingModule
  ]
})
export class TablesModule { }
