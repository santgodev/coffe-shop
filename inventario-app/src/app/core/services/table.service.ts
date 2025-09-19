import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Table, CreateTableRequest, UpdateTableRequest, Reservation, CreateReservationRequest, TableStats, Order } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private tablesSubject = new BehaviorSubject<Table[]>(this.getMockTables());
  public tables$ = this.tablesSubject.asObservable();

  private reservationsSubject = new BehaviorSubject<Reservation[]>(this.getMockReservations());
  public reservations$ = this.reservationsSubject.asObservable();

  private getMockTables(): Table[] {
    return [
      {
        id: 1,
        number: 1,
        name: 'Mesa 1',
        capacity: 2,
        status: 'available',
        location: 'indoor',
        shape: 'round',
        zoneId: 1,
        position: { x: 100, y: 100 },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        number: 2,
        name: 'Mesa 2',
        capacity: 4,
        status: 'occupied',
        location: 'indoor',
        shape: 'square',
        zoneId: 1,
        position: { x: 200, y: 100 },
        currentOrder: {
          id: 1,
          tableId: 2,
          customerName: 'Juan Pérez',
          items: [
            {
              id: 1,
              orderId: 1,
              productId: 1,
              productName: 'Café Americano',
              quantity: 2,
              unitPrice: 3.50,
              total: 7.00
            }
          ],
          subtotal: 7.00,
          tax: 1.12,
          total: 8.12,
          status: 'open',
          startTime: new Date(),
          userId: 1,
          userName: 'Mesero'
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        number: 3,
        name: 'Mesa 3',
        capacity: 6,
        status: 'reserved',
        location: 'outdoor',
        shape: 'rectangle',
        zoneId: 1,
        position: { x: 300, y: 100 },
        reservation: {
          id: 1,
          tableId: 3,
          customerName: 'María García',
          customerPhone: '555-0123',
          customerEmail: 'maria@email.com',
          date: new Date(),
          startTime: '19:00',
          endTime: '21:00',
          partySize: 4,
          status: 'confirmed',
          specialRequests: 'Mesa cerca de la ventana',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 4,
        number: 4,
        name: 'Mesa 4',
        capacity: 2,
        status: 'maintenance',
        location: 'indoor',
        shape: 'round',
        zoneId: 1,
        position: { x: 100, y: 200 },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 5,
        number: 5,
        name: 'Terraza 1',
        capacity: 4,
        status: 'available',
        location: 'terrace',
        shape: 'square',
        zoneId: 1,
        position: { x: 200, y: 200 },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 6,
        number: 6,
        name: 'Terraza 2',
        capacity: 8,
        status: 'available',
        location: 'terrace',
        shape: 'rectangle',
        zoneId: 1,
        position: { x: 300, y: 200 },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  private getMockReservations(): Reservation[] {
    return [
      {
        id: 1,
        tableId: 3,
        customerName: 'María García',
        customerPhone: '555-0123',
        customerEmail: 'maria@email.com',
        date: new Date(),
        startTime: '19:00',
        endTime: '21:00',
        partySize: 4,
        status: 'confirmed',
        specialRequests: 'Mesa cerca de la ventana',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
  }

  getTables(): Observable<Table[]> {
    return this.tables$;
  }

  getTable(id: number): Observable<Table | undefined> {
    const tables = this.tablesSubject.value;
    const table = tables.find(t => t.id === id);
    return of(table);
  }

  createTable(tableData: CreateTableRequest): Observable<Table> {
    const tables = this.tablesSubject.value;
    const newTable: Table = {
      id: Math.max(...tables.map(t => t.id)) + 1,
      ...tableData,
      status: 'available',
      shape: 'round',
      zoneId: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedTables = [...tables, newTable];
    this.tablesSubject.next(updatedTables);
    return of(newTable);
  }

  updateTable(id: number, tableData: UpdateTableRequest): Observable<Table> {
    const tables = this.tablesSubject.value;
    const index = tables.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Mesa no encontrada');
    }

    const updatedTable = {
      ...tables[index],
      ...tableData,
      updatedAt: new Date()
    };

    const updatedTables = [...tables];
    updatedTables[index] = updatedTable;
    this.tablesSubject.next(updatedTables);
    
    return of(updatedTable);
  }

  deleteTable(id: number): Observable<boolean> {
    const tables = this.tablesSubject.value;
    const updatedTables = tables.filter(t => t.id !== id);
    this.tablesSubject.next(updatedTables);
    return of(true);
  }

  openTable(tableId: number, customerName: string): Observable<Table> {
    return this.updateTable(tableId, {
      id: tableId,
      status: 'occupied',
      currentOrder: {
        id: Math.floor(Math.random() * 1000),
        tableId: tableId,
        customerName: customerName,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        status: 'open',
        startTime: new Date(),
        userId: 1,
        userName: 'Mesero'
      }
    });
  }

  closeTable(tableId: number): Observable<Table> {
    return this.updateTable(tableId, {
      id: tableId,
      status: 'available',
      currentOrder: undefined
    });
  }

  getReservations(): Observable<Reservation[]> {
    return this.reservations$;
  }

  createReservation(reservationData: CreateReservationRequest): Observable<Reservation> {
    const reservations = this.reservationsSubject.value;
    const newReservation: Reservation = {
      id: Math.max(...reservations.map(r => r.id)) + 1,
      ...reservationData,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedReservations = [...reservations, newReservation];
    this.reservationsSubject.next(updatedReservations);

    // Update table status
    this.updateTable(reservationData.tableId, {
      id: reservationData.tableId,
      status: 'reserved',
      reservation: newReservation
    });

    return of(newReservation);
  }

  getTableStats(): Observable<TableStats> {
    const tables = this.tablesSubject.value;
    const activeTables = tables.filter(t => t.isActive);
    
    const stats: TableStats = {
      totalTables: activeTables.length,
      availableTables: activeTables.filter(t => t.status === 'available').length,
      occupiedTables: activeTables.filter(t => t.status === 'occupied').length,
      reservedTables: activeTables.filter(t => t.status === 'reserved').length,
      maintenanceTables: activeTables.filter(t => t.status === 'maintenance').length,
      totalRevenue: 0, // Calculate from orders
      averageOrderValue: 0, // Calculate from orders
      peakHours: ['12:00-14:00', '19:00-21:00']
    };

    return of(stats);
  }
}
