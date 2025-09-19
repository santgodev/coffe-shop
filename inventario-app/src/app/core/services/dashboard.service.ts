import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardMetrics, TopSellingProduct, MonthlyRevenue, InventoryStatus } from '../../models';
import { ProductService } from './product.service';
import { SaleService } from './sale.service';
import { InventoryService } from './inventory.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private inventoryService: InventoryService
  ) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return combineLatest([
      this.productService.getProducts(),
      this.saleService.getSales(),
      this.saleService.getTotalRevenue(),
      this.inventoryService.getInventoryReport()
    ]).pipe(
      map(([products, sales, totalRevenue, inventoryReport]) => {
        const completedSales = sales.filter(s => s.status === 'completed');
        const recentSales = completedSales.filter(s => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return s.createdAt >= oneWeekAgo;
        });

        const lowStockProducts = inventoryReport.filter(item => 
          item.currentStock <= item.minStock
        ).length;

        const topSellingProducts = this.getTopSellingProducts(completedSales);
        const monthlyRevenue = this.getMonthlyRevenue(completedSales);
        const inventoryStatus = this.getInventoryStatus(inventoryReport);

        return {
          totalProducts: products.length,
          totalSales: completedSales.length,
          totalRevenue: totalRevenue,
          lowStockProducts,
          recentSales: recentSales.length,
          topSellingProducts,
          monthlyRevenue,
          inventoryStatus
        };
      })
    );
  }

  private getTopSellingProducts(sales: any[]): TopSellingProduct[] {
    const productSales = new Map<number, { name: string; quantity: number; revenue: number }>();

    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (productSales.has(item.productId)) {
          const existing = productSales.get(item.productId)!;
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.total
          });
        }
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  }

  private getMonthlyRevenue(sales: any[]): MonthlyRevenue[] {
    const monthlyData = new Map<string, { revenue: number; sales: number }>();

    sales.forEach(sale => {
      const month = sale.createdAt.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (monthlyData.has(month)) {
        const existing = monthlyData.get(month)!;
        existing.revenue += sale.total;
        existing.sales += 1;
      } else {
        monthlyData.set(month, {
          revenue: sale.total,
          sales: 1
        });
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        sales: data.sales
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }

  private getInventoryStatus(inventoryReport: any[]): InventoryStatus {
    let normal = 0;
    let low = 0;
    let out = 0;
    let overstock = 0;

    inventoryReport.forEach(item => {
      if (item.currentStock === 0) {
        out++;
      } else if (item.currentStock <= item.minStock) {
        low++;
      } else if (item.currentStock >= item.maxStock) {
        overstock++;
      } else {
        normal++;
      }
    });

    return { normal, low, out, overstock };
  }
}
