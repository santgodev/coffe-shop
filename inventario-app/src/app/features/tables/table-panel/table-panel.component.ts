import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Table, TableStats } from '../../../models';
import { TableService } from '../../../core/services';
import { TableDialogComponent } from '../table-dialog/table-dialog.component';

interface StatItem {
  key: string;
  label: string;
  value: number;
}

@Component({
  selector: 'app-table-panel',
  templateUrl: './table-panel.component.html',
  styleUrls: ['./table-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
    // TableDialogComponent // Imported as standalone
  ]
})
export class TablePanelComponent implements OnInit {
  tables$: Observable<Table[]>;
  stats$: Observable<StatItem[]>;
  filteredTables: Table[] = [];
  isGridView = true;
  selectedStatus = '';
  selectedLocation = '';

  constructor(
    private tableService: TableService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tables$ = this.tableService.getTables();
    this.stats$ = this.getStats();
  }

  ngOnInit(): void {
    this.tables$.subscribe(tables => {
      this.filteredTables = tables;
    });
  }

  private getStats(): Observable<StatItem[]> {
    return this.tableService.getTableStats().pipe(
      map(stats => [
        { key: 'available', label: 'Disponibles', value: stats.availableTables },
        { key: 'occupied', label: 'Ocupadas', value: stats.occupiedTables },
        { key: 'reserved', label: 'Reservadas', value: stats.reservedTables },
        { key: 'maintenance', label: 'Mantenimiento', value: stats.maintenanceTables }
      ])
    );
  }

  getStatIcon(key: string): string {
    const icons: { [key: string]: string } = {
      'available': 'check_circle',
      'occupied': 'restaurant',
      'reserved': 'event',
      'maintenance': 'build'
    };
    return icons[key] || 'help';
  }

  getStatIconClass(key: string): string {
    return key;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'available': 'check_circle',
      'occupied': 'restaurant',
      'reserved': 'event',
      'maintenance': 'build'
    };
    return icons[status] || 'help';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'available': 'Disponible',
      'occupied': 'Ocupada',
      'reserved': 'Reservada',
      'maintenance': 'Mantenimiento'
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

  toggleView(): void {
    this.isGridView = !this.isGridView;
  }

  filterTables(): void {
    this.tables$.subscribe(tables => {
      this.filteredTables = tables.filter(table => {
        const matchesStatus = !this.selectedStatus || table.status === this.selectedStatus;
        const matchesLocation = !this.selectedLocation || table.location === this.selectedLocation;
        return matchesStatus && matchesLocation;
      });
    });
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedLocation = '';
    this.filterTables();
  }

  openTableDialog(table?: Table): void {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: '600px',
      data: table || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTables();
        this.snackBar.open(
          table ? 'Mesa actualizada exitosamente' : 'Mesa creada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  openTable(table: Table): void {
    const customerName = prompt('Nombre del cliente:');
    if (customerName) {
      this.tableService.openTable(table.id, customerName).subscribe({
        next: () => {
          this.refreshTables();
          this.snackBar.open(`Mesa ${table.number} abierta para ${customerName}`, 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error opening table:', error);
          this.snackBar.open('Error al abrir la mesa', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  closeTable(table: Table): void {
    if (confirm(`¿Cerrar la mesa ${table.number}?`)) {
      this.tableService.closeTable(table.id).subscribe({
        next: () => {
          this.refreshTables();
          this.snackBar.open(`Mesa ${table.number} cerrada`, 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error closing table:', error);
          this.snackBar.open('Error al cerrar la mesa', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  editTable(table: Table): void {
    this.openTableDialog(table);
  }

  private refreshTables(): void {
    this.tables$.subscribe(tables => {
      this.filteredTables = tables;
      this.filterTables();
    });
  }
}