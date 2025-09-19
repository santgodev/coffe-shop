import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { InventoryMovement, CreateInventoryMovementRequest, InventoryReport } from '../../models';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private movementsSubject = new BehaviorSubject<InventoryMovement[]>(this.getMockMovements());
  public movements$ = this.movementsSubject.asObservable();

  constructor(private productService: ProductService) {}

  private getMockMovements(): InventoryMovement[] {
    return [
      {
        id: 1,
        productId: 1,
        productName: 'Laptop HP Pavilion',
        type: 'in',
        quantity: 20,
        reason: 'Compra inicial',
        reference: 'PO-001',
        userId: 1,
        userName: 'Administrador',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        productId: 1,
        productName: 'Laptop HP Pavilion',
        type: 'out',
        quantity: 5,
        reason: 'Venta',
        reference: 'SALE-001',
        userId: 2,
        userName: 'Gerente',
        createdAt: new Date('2024-01-16')
      },
      {
        id: 3,
        productId: 2,
        productName: 'Camiseta Nike',
        type: 'in',
        quantity: 100,
        reason: 'Compra de stock',
        reference: 'PO-002',
        userId: 1,
        userName: 'Administrador',
        createdAt: new Date('2024-01-16')
      },
      {
        id: 4,
        productId: 2,
        productName: 'Camiseta Nike',
        type: 'out',
        quantity: 50,
        reason: 'Venta',
        reference: 'SALE-002',
        userId: 3,
        userName: 'Empleado',
        createdAt: new Date('2024-01-17')
      }
    ];
  }

  getMovements(): Observable<InventoryMovement[]> {
    return this.movements$;
  }

  getMovementsByProduct(productId: number): Observable<InventoryMovement[]> {
    const movements = this.movementsSubject.value;
    const productMovements = movements.filter(m => m.productId === productId);
    return of(productMovements);
  }

  createMovement(movementData: CreateInventoryMovementRequest): Observable<InventoryMovement> {
    const movements = this.movementsSubject.value;
    
    // Get product name
    this.productService.getProduct(movementData.productId).subscribe(product => {
      if (product) {
        const newMovement: InventoryMovement = {
          id: Math.max(...movements.map(m => m.id)) + 1,
          productId: movementData.productId,
          productName: product.name,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason,
          reference: movementData.reference,
          userId: 1, // Mock user ID
          userName: 'Usuario Actual', // Mock user name
          createdAt: new Date()
        };

        const updatedMovements = [...movements, newMovement];
        this.movementsSubject.next(updatedMovements);
      }
    });

    // Return a temporary movement for immediate response
    const newMovement: InventoryMovement = {
      id: Math.max(...movements.map(m => m.id)) + 1,
      productId: movementData.productId,
      productName: 'Producto', // Will be updated
      type: movementData.type,
      quantity: movementData.quantity,
      reason: movementData.reason,
      reference: movementData.reference,
      userId: 1,
      userName: 'Usuario Actual',
      createdAt: new Date()
    };

    return of(newMovement);
  }

  getInventoryReport(): Observable<InventoryReport[]> {
    // This would typically aggregate data from products and movements
    const mockReport: InventoryReport[] = [
      {
        productId: 1,
        productName: 'Laptop HP Pavilion',
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        totalIn: 20,
        totalOut: 5,
        lastMovement: new Date('2024-01-16'),
        status: 'normal'
      },
      {
        productId: 2,
        productName: 'Camiseta Nike',
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        totalIn: 100,
        totalOut: 50,
        lastMovement: new Date('2024-01-17'),
        status: 'normal'
      }
    ];

    return of(mockReport);
  }

  getLowStockProducts(): Observable<InventoryReport[]> {
    return this.getInventoryReport().pipe(
      // In a real implementation, this would filter products with low stock
      // For now, return the mock data
    );
  }
}
