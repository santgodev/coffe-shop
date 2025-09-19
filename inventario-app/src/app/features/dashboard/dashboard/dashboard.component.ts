import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardMetrics, User } from '../../../models';
import { AuthService, DashboardService } from '../../../core/services';

interface Activity {
  icon: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  metrics$: Observable<DashboardMetrics>;
  recentActivities: Activity[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    this.metrics$ = this.dashboardService.getDashboardMetrics();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRecentActivities();
  }

  private loadRecentActivities(): void {
    // Mock recent activities
    this.recentActivities = [
      {
        icon: 'point_of_sale',
        text: 'Nueva venta registrada por $199.99',
        time: 'Hace 2 horas'
      },
      {
        icon: 'inventory',
        text: 'Stock actualizado para Laptop HP Pavilion',
        time: 'Hace 4 horas'
      },
      {
        icon: 'warning',
        text: 'Alerta: Stock bajo en Camiseta Nike',
        time: 'Ayer'
      },
      {
        icon: 'add_box',
        text: 'Nuevo producto agregado: Silla de Oficina',
        time: 'Hace 2 días'
      }
    ];
  }
}