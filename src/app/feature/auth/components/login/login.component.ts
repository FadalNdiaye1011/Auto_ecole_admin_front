import { Component, resource, ResourceStatus } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authForm: FormGroup;
  isLoading = false;
  showPassword = false;


  // resourceStatus = ResourceStatus

  // userResource = resource({
  //   loader: async () => {
  //     const response = await fetch('https://jsonplaceholder.typicode.com/users');
  //     return response.json() as Promise<any>;
  //   }
  // });

  constructor(private fb: FormBuilder,private authService:AuthService,private router: Router,) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }



  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
        this.authService.postData("users/login", this.authForm.value).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (response: any) => {
            console.log(response);
            if (response.status) {
              localStorage.setItem(environment.appName + "_token", response.data.token);
              localStorage.setItem(environment.appName + '_user', JSON.stringify(response.data));
            // Naviguer vers l'URL décodée
            this.router.navigate(['/dashboard'])
            }
          },
          error: (error: any) => {
            console.error('Login error:', error);
          }
        });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.authForm.controls).forEach(key => {
        const control = this.authForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}





