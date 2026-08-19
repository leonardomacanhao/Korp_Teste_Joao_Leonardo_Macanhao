import { Component, AfterViewInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'Korp NF';
  isDark = false;

  private sunPath = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
  private moonPath = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path>';

  constructor(private theme: ThemeService) {
    this.isDark = this.theme.isDark();
  }

  ngAfterViewInit(): void {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    }

    // Card parallax mouse effect
    document.querySelectorAll('.card').forEach(card => {
      const handler = (ev: Event) => {
        const e = ev as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        (card as HTMLElement).style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        (card as HTMLElement).style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      };
      card.addEventListener('mousemove', handler as EventListener);
    });

    // Nav link active-switching
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const active = document.querySelector('.nav-links a.active');
        if (active) active.classList.remove('active');
        (link as HTMLElement).classList.add('active');
        navLinks?.classList.remove('open');
      });
    });

    // Initialize theme icon
    this.updateThemeIcon();
  }

  toggleTheme() {
    this.theme.toggle();
    this.isDark = this.theme.isDark();
    this.updateThemeIcon();
  }

  private updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (!themeIcon) return;
    themeIcon.innerHTML = this.isDark ? this.sunPath : this.moonPath;
  }
}