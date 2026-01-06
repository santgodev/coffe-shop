import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  demoUsers = [
    { role: 'admin', username: 'admin' },
    { role: 'manager', username: 'manager' },
    { role: 'employee', username: 'employee' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  isRegisterMode = false;

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      if (this.isRegisterMode) {
        this.authService.signUp(username, password).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response.error) {
              alert('Error al registrarse: ' + response.error.message);
            } else {
              alert('Registro exitoso. Por favor revisa tu correo para confirmar (si está habilitado) o inicia sesión.');
              this.isRegisterMode = false; // Switch back to login
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error(err);
            alert('Error en el registro');
          }
        });
      } else {
        this.authService.login({ username, password }).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response.error) {
              alert('Error de login: ' + response.error.message);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Error de login:', error);
            alert('Credenciales inválidas o error de conexión.');
          }
        });
      }
    }
  }

  fillDemoCredentials(role: string): void {
    const user = this.demoUsers.find(u => u.role === role);
    if (user) {
      this.loginForm.patchValue({
        username: user.username,
        password: 'password'
      });
    }
  }
}