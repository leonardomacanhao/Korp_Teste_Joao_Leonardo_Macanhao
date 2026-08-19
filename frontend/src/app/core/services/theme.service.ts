import { Injectable } from '@angular/core';

const STORAGE_KEY = 'korp:theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = false;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.dark = saved === 'dark';
    this.apply();
  }

  isDark() { return this.dark; }

  toggle() {
    this.dark = !this.dark;
    this.save();
    this.apply();
  }

  setDark(d: boolean) {
    this.dark = d;
    this.save();
    this.apply();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, this.dark ? 'dark' : 'light');
  }

  private apply() {
    if (this.dark) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }
}
