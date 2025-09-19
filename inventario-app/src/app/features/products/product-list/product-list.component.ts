import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product, ProductCategory } from '../../../models';
import { ProductService } from '../../../core/services';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
    // ProductDialogComponent // Imported as standalone
  ]
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  categories$: Observable<ProductCategory[]>;
  filteredProducts: Product[] = [];
  searchQuery = '';
  selectedCategory = '';
  categories: ProductCategory[] = [];

  displayedColumns: string[] = [
    'id', 'image', 'name', 'category', 'price', 'stock', 'status', 'actions'
  ];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.products$ = this.productService.getProducts();
    this.categories$ = this.productService.getCategories();
  }

  ngOnInit(): void {
    this.products$.subscribe(products => {
      this.filteredProducts = products;
    });

    this.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  onSearch(): void {
    this.filterProducts();
  }

  onCategoryFilter(): void {
    this.filterProducts();
  }

  private filterProducts(): void {
    this.products$.subscribe(products => {
      this.filteredProducts = products.filter(product => {
        const matchesSearch = !this.searchQuery || 
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesCategory = !this.selectedCategory || 
          product.category === this.selectedCategory;

        return matchesSearch && matchesCategory;
      });
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filterProducts();
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      data: product || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshProducts();
        this.snackBar.open(
          product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  editProduct(product: Product): void {
    this.openProductDialog(product);
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.refreshProducts();
          this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  private refreshProducts(): void {
    this.products$.subscribe(products => {
      this.filteredProducts = products;
      this.filterProducts();
    });
  }
}