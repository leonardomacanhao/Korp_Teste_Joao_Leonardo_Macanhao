import { Component, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'Korp NF';
  isDark = true;

  showHome = true;

  constructor(private router: Router) {
    const url = this.router.url || '/';
    this.showHome = url === '/' || url.startsWith('/home');
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

    // no theme toggle / icon anymore

    // Update showHome on route changes so routed pages replace the hero
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const u = ev.urlAfterRedirects || (ev as any).url;
        this.showHome = (u === '/' || u.startsWith('/home'));
      }
    });
  }

  // theme toggling removed
}