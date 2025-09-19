import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'tables', loadChildren: () => import('../../features/tables/tables.module').then(m => m.TablesModule) },
      { path: 'dashboard', loadChildren: () => import('../../features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'products', loadChildren: () => import('../../features/products/products.module').then(m => m.ProductsModule) },
      { path: 'inventory', loadChildren: () => import('../../features/inventory/inventory.module').then(m => m.InventoryModule) },
      { path: 'sales', loadChildren: () => import('../../features/sales/sales.module').then(m => m.SalesModule) },
      { path: 'reports', loadChildren: () => import('../../features/reports/reports.module').then(m => m.ReportsModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }