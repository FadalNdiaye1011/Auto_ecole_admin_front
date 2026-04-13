import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from './feature/auth/services/auth.service';
import { SessionService } from './core/services/session.service';
import { LayoutModule } from './shared/layout/layout.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'autoEcole';

  constructor(
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticate()) {
      this.sessionService.start();
      this.authService.refreshMe().pipe(catchError(() => of(null))).subscribe();
    }
  }
}
