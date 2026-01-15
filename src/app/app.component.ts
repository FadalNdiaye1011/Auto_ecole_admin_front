import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutModule } from './shared/layout/layout.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LayoutModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'autoEcole';
}
