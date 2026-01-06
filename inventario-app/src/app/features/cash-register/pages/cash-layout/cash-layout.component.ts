import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CashService } from '../../../../core/services/cash.service';
import { CashShift } from '../../../../models/supabase.types';
import { CashDashboardComponent } from '../../components/cash-dashboard/cash-dashboard.component';
import { CashOpeningComponent } from '../../components/cash-opening/cash-opening.component';

@Component({
  selector: 'app-cash-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    CashDashboardComponent,
    CashOpeningComponent
  ],
  template: `
    <div class="cash-layout-container">
      <!-- Loading State -->
      <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>

      <ng-container *ngIf="!isLoading">
        <!-- If Shift is Open -> Show Dashboard -->
        <app-cash-dashboard *ngIf="currentShift; else openingTemplate" [shift]="currentShift"></app-cash-dashboard>
        
        <!-- Else -> Show Opening Screen -->
        <ng-template #openingTemplate>
           <app-cash-opening></app-cash-opening>
        </ng-template>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
    }
    .cash-layout-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
      padding: 0;
    }
  `]
})
export class CashLayoutComponent implements OnInit {
  currentShift: CashShift | null = null;
  isLoading = true;

  constructor(private cashService: CashService) { }

  ngOnInit(): void {
    this.cashService.currentShift$.subscribe(shift => {
      this.currentShift = shift;
      this.isLoading = false;
    });
  }
}
