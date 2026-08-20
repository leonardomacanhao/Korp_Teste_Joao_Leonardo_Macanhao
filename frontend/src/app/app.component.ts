import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APPLICATION_CONFIG } from './core/config/application.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly app = APPLICATION_CONFIG;
  readonly currentYear = new Date().getFullYear();
  menuOpen = false;

  constructor(private readonly documentTitle: Title) {}

  ngOnInit(): void {
    this.documentTitle.setTitle(`${this.app.name} — ${this.app.description}`);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
