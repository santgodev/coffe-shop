import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, CdkDragMove, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { Table, Zone, TablePosition } from '../../../models';
import { TableService, ZoneService } from '../../../core/services';
import { TableDetailsComponent } from '../table-details/table-details.component';

@Component({
  selector: 'app-table-board',
  templateUrl: './table-board.component.html',
  styleUrls: ['./table-board.component.scss'],
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
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    DragDropModule,
    TableDetailsComponent
  ]
})
export class TableBoardComponent implements OnInit, OnDestroy {
  zone: Zone | undefined;
  tables: Table[] = [];
  selectedTable: Table | null = null;
  isEditMode = false;
  showGrid = true;
  tableSize = 80;
  gridSize = 20;
  snapToGrid = true;
  zoomLevel = 100;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    private zoneService: ZoneService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadZone();
    this.loadTables();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadZone(): void {
    const zoneId = this.route.snapshot.paramMap.get('zoneId');
    if (zoneId) {
      this.zoneService.getZone(+zoneId).subscribe(zone => {
        this.zone = zone;
        if (zone) {
          this.tables = zone.tables || [];
        }
      });
    }
  }

  private loadTables(): void {
    this.tableService.getTables().subscribe(tables => {
      if (this.zone) {
        this.tables = tables.filter(table => table.zoneId === this.zone!.id);
      } else {
        this.tables = tables;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tables']);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.selectedTable = null;
      this.saveLayout();
    }
  }

  toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  addTable(): void {
    if (!this.zone) return;

    const newTable: Table = {
      id: Math.max(...this.tables.map(t => t.id), 0) + 1,
      number: this.tables.length + 1,
      name: `Mesa ${this.tables.length + 1}`,
      capacity: 4,
      status: 'available',
      location: 'indoor',
      shape: 'round',
      zoneId: this.zone.id,
      position: { x: 100, y: 100 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tables.push(newTable);
    this.selectedTable = newTable;
    this.snackBar.open('Nueva mesa agregada', 'Cerrar', { duration: 3000 });
  }

  selectTable(table: Table): void {
    if (this.isEditMode) {
      this.selectedTable = table;
    }
  }

  openTableDetails(table: Table): void {
    this.selectedTable = table;
  }

  closeTableDetails(): void {
    this.selectedTable = null;
  }

  onTableUpdated(updatedTable: Table): void {
    const index = this.tables.findIndex(t => t.id === updatedTable.id);
    if (index !== -1) {
      this.tables[index] = updatedTable;
    }
    this.selectedTable = updatedTable;
  }

  editTable(table: Table): void {
    this.selectedTable = table;
  }

  deleteTable(table: Table): void {
    if (confirm(`¿Eliminar la mesa ${table.number}?`)) {
      this.tables = this.tables.filter(t => t.id !== table.id);
      if (this.selectedTable?.id === table.id) {
        this.selectedTable = null;
      }
      this.snackBar.open(`Mesa ${table.number} eliminada`, 'Cerrar', { duration: 3000 });
    }
  }

  onTableMoved(event: CdkDragDrop<Table[]>): void {
    if (event.previousContainer === event.container) {
      // Mover dentro del mismo contenedor
      const table = event.item.data;
      const newPosition = event.container.element.nativeElement.getBoundingClientRect();
      const canvasRect = event.container.element.nativeElement.getBoundingClientRect();
      
      let x = event.dropPoint.x - canvasRect.left;
      let y = event.dropPoint.y - canvasRect.top;
      
      if (this.snapToGrid) {
        x = Math.round(x / this.gridSize) * this.gridSize;
        y = Math.round(y / this.gridSize) * this.gridSize;
      }
      
      table.position = { x, y };
    }
  }

  onNewTableDropped(event: any): void {
    // Crear nueva mesa en la posición del drop
    const dropPoint = event.dropPoint;
    const canvasRect = event.container.element.nativeElement.getBoundingClientRect();
    
    let x = dropPoint.x - canvasRect.left;
    let y = dropPoint.y - canvasRect.top;
    
    if (this.snapToGrid) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }
    
    this.addTableAtPosition(x, y);
  }

  private addTableAtPosition(x: number, y: number): void {
    if (!this.zone) return;

    const newTable: Table = {
      id: Math.max(...this.tables.map(t => t.id), 0) + 1,
      number: this.tables.length + 1,
      name: `Mesa ${this.tables.length + 1}`,
      capacity: 4,
      status: 'available',
      location: 'indoor',
      shape: 'round',
      zoneId: this.zone.id,
      position: { x, y },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tables.push(newTable);
    this.selectedTable = newTable;
  }

  updateTableSize(): void {
    // El tamaño se actualiza automáticamente via CSS
  }

  updateZoom(): void {
    // El zoom se actualiza automáticamente via CSS
  }

  getTableCountByStatus(status: string): number {
    return this.tables.filter(table => table.status === status).length;
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

  trackByTableId(index: number, table: Table): number {
    return table.id;
  }

  saveTableChanges(): void {
    if (this.selectedTable) {
      // TODO: Implement save to backend
      this.snackBar.open('Cambios guardados', 'Cerrar', { duration: 3000 });
      this.selectedTable = null;
    }
  }

  cancelTableChanges(): void {
    this.selectedTable = null;
  }

  private saveLayout(): void {
    // TODO: Implement save layout to backend
    this.snackBar.open('Layout guardado', 'Cerrar', { duration: 3000 });
  }
}