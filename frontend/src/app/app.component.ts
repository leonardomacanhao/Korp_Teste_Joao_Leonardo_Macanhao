import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Korp NF';
  isDark = false;

  constructor(private theme: ThemeService) {
    this.isDark = this.theme.isDark();
  }

  toggleTheme() {
    this.theme.toggle();
    this.isDark = this.theme.isDark();
  }
}