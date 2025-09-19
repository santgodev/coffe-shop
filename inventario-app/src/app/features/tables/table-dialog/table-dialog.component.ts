import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Table, CreateTableRequest, UpdateTableRequest } from '../../../models';
import { TableService } from '../../../core/services';

@Component({
  selector: 'app-table-dialog',
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ]
})
export class TableDialogComponent implements OnInit {
  tableForm: FormGroup;
  isEdit = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private tableService: TableService,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Table | null
  ) {
    this.isEdit = !!data;
    this.tableForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEdit && this.data) {
      this.populateForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      number: [1, [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required]],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      location: ['indoor', [Validators.required]],
      positionX: [100, [Validators.min(0)]],
      positionY: [100, [Validators.min(0)]],
      status: ['available']
    });
  }

  private populateForm(): void {
    if (this.data) {
      this.tableForm.patchValue({
        number: this.data.number,
        name: this.data.name,
        capacity: this.data.capacity,
        location: this.data.location,
        positionX: this.data.position.x,
        positionY: this.data.position.y,
        status: this.data.status
      });
    }
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

  onSave(): void {
    if (this.tableForm.valid) {
      this.isLoading = true;
      const formValue = this.tableForm.value;

      if (this.isEdit && this.data) {
        const updateData: UpdateTableRequest = {
          id: this.data.id,
          number: formValue.number,
          name: formValue.name,
          capacity: formValue.capacity,
          location: formValue.location,
          position: {
            x: formValue.positionX,
            y: formValue.positionY
          },
          status: formValue.status
        };

        this.tableService.updateTable(this.data.id, updateData).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating table:', error);
            this.isLoading = false;
          }
        });
      } else {
        const createData: CreateTableRequest = {
          number: formValue.number,
          name: formValue.name,
          capacity: formValue.capacity,
          location: formValue.location,
          position: {
            x: formValue.positionX,
            y: formValue.positionY
          }
        };

        this.tableService.createTable(createData).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating table:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}