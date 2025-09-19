import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest, ProductCategory } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>(this.getMockProducts());
  public products$ = this.productsSubject.asObservable();

  private categories: ProductCategory[] = [
    { id: 1, name: 'Electrónicos', description: 'Dispositivos electrónicos', isActive: true },
    { id: 2, name: 'Ropa', description: 'Vestimenta y accesorios', isActive: true },
    { id: 3, name: 'Hogar', description: 'Artículos para el hogar', isActive: true },
    { id: 4, name: 'Deportes', description: 'Artículos deportivos', isActive: true },
    { id: 5, name: 'Libros', description: 'Libros y material educativo', isActive: true }
  ];

  private getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Laptop HP Pavilion',
        description: 'Laptop HP Pavilion 15 pulgadas, 8GB RAM, 256GB SSD',
        sku: 'LAP-HP-001',
        barcode: '1234567890123',
        category: 'Electrónicos',
        brand: 'HP',
        price: 899.99,
        cost: 650.00,
        stock: 15,
        minStock: 5,
        maxStock: 50,
        unit: 'unidad',
        isActive: true,
        imageUrl: 'https://via.placeholder.com/300x200',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Camiseta Nike',
        description: 'Camiseta deportiva Nike talla M',
        sku: 'CAM-NI-001',
        barcode: '1234567890124',
        category: 'Ropa',
        brand: 'Nike',
        price: 29.99,
        cost: 15.00,
        stock: 50,
        minStock: 10,
        maxStock: 100,
        unit: 'unidad',
        isActive: true,
        imageUrl: 'https://via.placeholder.com/300x200',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: 3,
        name: 'Silla de Oficina',
        description: 'Silla ergonómica para oficina',
        sku: 'SIL-OF-001',
        barcode: '1234567890125',
        category: 'Hogar',
        brand: 'IKEA',
        price: 199.99,
        cost: 120.00,
        stock: 8,
        minStock: 3,
        maxStock: 25,
        unit: 'unidad',
        isActive: true,
        imageUrl: 'https://via.placeholder.com/300x200',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      }
    ];
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProduct(id: number): Observable<Product | undefined> {
    const products = this.productsSubject.value;
    const product = products.find(p => p.id === id);
    return of(product);
  }

  createProduct(productData: CreateProductRequest): Observable<Product> {
    const products = this.productsSubject.value;
    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id)) + 1,
      ...productData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedProducts = [...products, newProduct];
    this.productsSubject.next(updatedProducts);
    return of(newProduct);
  }

  updateProduct(id: number, productData: UpdateProductRequest): Observable<Product> {
    const products = this.productsSubject.value;
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    const updatedProduct = {
      ...products[index],
      ...productData,
      updatedAt: new Date()
    };

    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    this.productsSubject.next(updatedProducts);
    
    return of(updatedProduct);
  }

  deleteProduct(id: number): Observable<boolean> {
    const products = this.productsSubject.value;
    const updatedProducts = products.filter(p => p.id !== id);
    this.productsSubject.next(updatedProducts);
    return of(true);
  }

  getCategories(): Observable<ProductCategory[]> {
    return of(this.categories);
  }

  searchProducts(query: string): Observable<Product[]> {
    const products = this.productsSubject.value;
    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return of(filteredProducts);
  }
}
