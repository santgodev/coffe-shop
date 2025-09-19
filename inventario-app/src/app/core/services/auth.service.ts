import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly MOCK_USERS: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@inventario.com',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      username: 'manager',
      email: 'manager@inventario.com',
      firstName: 'Gerente',
      lastName: 'Ventas',
      role: 'manager',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      username: 'employee',
      email: 'employee@inventario.com',
      firstName: 'Empleado',
      lastName: 'Tienda',
      role: 'employee',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  constructor() {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const user = this.MOCK_USERS.find(
      u => u.username === credentials.username && 
           credentials.password === 'password' // Simple mock password
    );

    if (user) {
      const response: LoginResponse = {
        user,
        token: 'mock-jwt-token-' + user.id,
        expiresIn: 3600
      };

      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      
      this.currentUserSubject.next(user);
      
      return of(response);
    } else {
      throw new Error('Credenciales inválidas');
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}
