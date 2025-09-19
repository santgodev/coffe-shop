import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Table } from '../../../models';
import { TableService } from '../../../core/services';

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TableDetailsComponent implements OnInit {
  @Input() table: Table | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() tableUpdated = new EventEmitter<Table>();

  constructor(
    private tableService: TableService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  closePanel(): void {
    this.close.emit();
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'available': 'check_circle',
      'occupied': 'restaurant',
      'reserved': 'event_available',
      'maintenance': 'build'
    };
    return icons[status] || 'help';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'available': 'Disponible',
      'occupied': 'Ocupada',
      'reserved': 'Reservada',
      'maintenance': 'En Mantenimiento'
    };
    return texts[status] || 'Desconocido';
  }

  getLocationText(location: string): string {
    const texts: { [key: string]: string } = {
      'indoor': 'Interior',
      'outdoor': 'Exterior',
      'terrace': 'Terraza',
      'private': 'Privada'
    };
    return texts[location] || 'Desconocida';
  }

  getShapeText(shape: string): string {
    const texts: { [key: string]: string } = {
      'round': 'Redonda',
      'square': 'Cuadrada',
      'rectangle': 'Rectangular'
    };
    return texts[shape] || 'Desconocida';
  }

  openTable(): void {
    if (!this.table) return;

    this.tableService.openTable(this.table.id, 'Cliente').subscribe({
      next: (updatedTable: Table) => {
        this.table = updatedTable;
        this.tableUpdated.emit(updatedTable);
        this.snackBar.open(`Mesa ${this.table?.number} abierta`, 'Cerrar', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error opening table:', error);
        this.snackBar.open('Error al abrir la mesa', 'Cerrar', { duration: 3000 });
      }
    });
  }

  closeTable(): void {
    if (!this.table) return;

    this.tableService.closeTable(this.table.id).subscribe({
      next: (updatedTable: Table) => {
        this.table = updatedTable;
        this.tableUpdated.emit(updatedTable);
        this.snackBar.open(`Mesa ${this.table?.number} cerrada`, 'Cerrar', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error closing table:', error);
        this.snackBar.open('Error al cerrar la mesa', 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewOrder(): void {
    if (!this.table?.currentOrder) return;
    
    // TODO: Implement order details dialog
    this.snackBar.open('Vista de pedido próximamente', 'Cerrar', { duration: 3000 });
  }

  confirmReservation(): void {
    if (!this.table) return;

    // TODO: Implement reservation system
    this.snackBar.open('Sistema de reservas próximamente', 'Cerrar', { duration: 3000 });
  }

  viewReservation(): void {
    if (!this.table?.reservation) return;
    
    // TODO: Implement reservation details dialog
    this.snackBar.open('Vista de reserva próximamente', 'Cerrar', { duration: 3000 });
  }

  completeMaintenance(): void {
    if (!this.table) return;

    this.tableService.updateTable(this.table.id, {
      id: this.table.id,
      status: 'available'
    }).subscribe({
      next: (updatedTable: Table) => {
        this.table = updatedTable;
        this.tableUpdated.emit(updatedTable);
        this.snackBar.open(`Mantenimiento completado para mesa ${this.table?.number}`, 'Cerrar', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error completing maintenance:', error);
        this.snackBar.open('Error al completar el mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  editTable(): void {
    // TODO: Implement table edit dialog
    this.snackBar.open('Editor de mesa próximamente', 'Cerrar', { duration: 3000 });
  }

  reserveTable(): void {
    // TODO: Implement reservation dialog
    this.snackBar.open('Sistema de reservas próximamente', 'Cerrar', { duration: 3000 });
  }

  setMaintenance(): void {
    if (!this.table) return;

    this.tableService.updateTable(this.table.id, {
      id: this.table.id,
      status: 'maintenance'
    }).subscribe({
      next: (updatedTable: Table) => {
        this.table = updatedTable;
        this.tableUpdated.emit(updatedTable);
        this.snackBar.open(`Mesa ${this.table?.number} en mantenimiento`, 'Cerrar', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error setting maintenance:', error);
        this.snackBar.open('Error al establecer mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteTable(): void {
    if (!this.table) return;

    if (confirm(`¿Eliminar la mesa ${this.table.number}? Esta acción no se puede deshacer.`)) {
      this.tableService.deleteTable(this.table.id).subscribe({
        next: () => {
          this.snackBar.open(`Mesa ${this.table?.number} eliminada`, 'Cerrar', { duration: 3000 });
          this.closePanel();
        },
        error: (error: any) => {
          console.error('Error deleting table:', error);
          this.snackBar.open('Error al eliminar la mesa', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}