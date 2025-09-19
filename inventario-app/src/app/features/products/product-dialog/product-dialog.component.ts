import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product, ProductCategory, CreateProductRequest, UpdateProductRequest } from '../../../models';
import { ProductService } from '../../../core/services';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;
  isEdit = false;
  isLoading = false;
  categories$: Observable<ProductCategory[]>;
  categories: ProductCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEdit = !!data;
    this.categories$ = this.productService.getCategories();
    
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      sku: ['', [Validators.required]],
      barcode: [''],
      category: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [0, [Validators.required, Validators.min(0)]],
      unit: ['unidad', [Validators.required]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.categories$.subscribe(categories => {
      this.categories = categories;
    });

    if (this.isEdit && this.data) {
      this.productForm.patchValue({
        name: this.data.name,
        description: this.data.description,
        sku: this.data.sku,
        barcode: this.data.barcode,
        category: this.data.category,
        brand: this.data.brand,
        price: this.data.price,
        cost: this.data.cost,
        stock: this.data.stock,
        minStock: this.data.minStock,
        maxStock: this.data.maxStock,
        unit: this.data.unit,
        imageUrl: this.data.imageUrl
      });
    }
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formValue = this.productForm.value;

      if (this.isEdit && this.data) {
        const updateRequest: UpdateProductRequest = {
          id: this.data.id,
          ...formValue
        };

        this.productService.updateProduct(this.data.id, updateRequest).subscribe({
          next: (updatedProduct) => {
            this.isLoading = false;
            this.dialogRef.close(updatedProduct);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating product:', error);
          }
        });
      } else {
        const createRequest: CreateProductRequest = formValue;

        this.productService.createProduct(createRequest).subscribe({
          next: (newProduct) => {
            this.isLoading = false;
            this.dialogRef.close(newProduct);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating product:', error);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}