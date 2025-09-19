import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Zone, CreateZoneRequest, UpdateZoneRequest, ZoneStats } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private zonesSubject = new BehaviorSubject<Zone[]>(this.getMockZones());
  public zones$ = this.zonesSubject.asObservable();

  private getMockZones(): Zone[] {
    return [
      {
        id: 1,
        name: 'Terraza',
        description: 'Área exterior con vista al jardín',
        type: 'terrace',
        capacity: 20,
        isActive: true,
        tables: [],
        layout: {
          width: 800,
          height: 600,
          backgroundColor: '#E8F5E8',
          gridSize: 20,
          snapToGrid: true
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Piso 1 - Interior',
        description: 'Área principal del café',
        type: 'indoor',
        floor: 1,
        capacity: 30,
        isActive: true,
        tables: [],
        layout: {
          width: 1000,
          height: 800,
          backgroundColor: '#F5F5F5',
          gridSize: 20,
          snapToGrid: true
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        name: 'Piso 2 - Privado',
        description: 'Área privada para eventos',
        type: 'private',
        floor: 2,
        capacity: 15,
        isActive: true,
        tables: [],
        layout: {
          width: 600,
          height: 500,
          backgroundColor: '#FFF8F0',
          gridSize: 20,
          snapToGrid: true
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 4,
        name: 'Exterior - Patio',
        description: 'Patio exterior con mesas al aire libre',
        type: 'outdoor',
        capacity: 25,
        isActive: true,
        tables: [],
        layout: {
          width: 700,
          height: 500,
          backgroundColor: '#E6F3FF',
          gridSize: 20,
          snapToGrid: true
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  getZones(): Observable<Zone[]> {
    return this.zones$;
  }

  getZone(id: number): Observable<Zone | undefined> {
    const zones = this.zonesSubject.value;
    const zone = zones.find(z => z.id === id);
    return of(zone);
  }

  createZone(zoneData: CreateZoneRequest): Observable<Zone> {
    const zones = this.zonesSubject.value;
    const newZone: Zone = {
      id: Math.max(...zones.map(z => z.id)) + 1,
      ...zoneData,
      isActive: true,
      tables: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedZones = [...zones, newZone];
    this.zonesSubject.next(updatedZones);
    return of(newZone);
  }

  updateZone(id: number, zoneData: UpdateZoneRequest): Observable<Zone> {
    const zones = this.zonesSubject.value;
    const index = zones.findIndex(z => z.id === id);
    
    if (index === -1) {
      throw new Error('Zona no encontrada');
    }

    const updatedZone = {
      ...zones[index],
      ...zoneData,
      updatedAt: new Date()
    };

    const updatedZones = [...zones];
    updatedZones[index] = updatedZone;
    this.zonesSubject.next(updatedZones);
    
    return of(updatedZone);
  }

  deleteZone(id: number): Observable<boolean> {
    const zones = this.zonesSubject.value;
    const updatedZones = zones.filter(z => z.id !== id);
    this.zonesSubject.next(updatedZones);
    return of(true);
  }

  getZoneStats(): Observable<ZoneStats> {
    const zones = this.zonesSubject.value;
    const activeZones = zones.filter(z => z.isActive);
    
    let totalTables = 0;
    let availableTables = 0;
    let occupiedTables = 0;
    let reservedTables = 0;
    let maintenanceTables = 0;

    activeZones.forEach(zone => {
      totalTables += zone.tables.length;
      zone.tables.forEach(table => {
        switch (table.status) {
          case 'available':
            availableTables++;
            break;
          case 'occupied':
            occupiedTables++;
            break;
          case 'reserved':
            reservedTables++;
            break;
          case 'maintenance':
            maintenanceTables++;
            break;
        }
      });
    });

    const stats: ZoneStats = {
      totalZones: zones.length,
      activeZones: activeZones.length,
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      maintenanceTables
    };

    return of(stats);
  }
}
