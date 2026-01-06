import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StationService } from '../../../../core/services';
import { Station } from '../../../../models/supabase.types';
import { StationDialogComponent } from '../../components/station-dialog/station-dialog.component';

@Component({
  selector: 'app-stations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="container p-4">
      <div class="header">
        <h1>Gestión de Estaciones (Cocinas)</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Nueva Estación
        </button>
      </div>

      <mat-card class="mt-4">
        <table mat-table [dataSource]="(stationService.stations$ | async) || []" class="w-full">
          
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button color="primary" (click)="openDialog(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteStation(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .w-full { width: 100%; }
  `]
})
export class StationsListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'actions'];

  constructor(
    public stationService: StationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Already loading in service constructor, but good to ensure
    this.stationService.loadStations();
  }

  openDialog(station?: Station): void {
    const dialogRef = this.dialog.open(StationDialogComponent, {
      width: '400px',
      data: station ? { ...station } : { name: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (station) {
          this.stationService.updateStation(station.id, result);
        } else {
          this.stationService.createStation(result);
        }
      }
    });
  }

  deleteStation(station: Station): void {
    if (confirm(`¿Estás seguro de eliminar la estación "${station.name}"?`)) {
      this.stationService.deleteStation(station.id);
    }
  }
}
