import { Injectable } from '@angular/core';

/**
 * ThemeService retained as a no-op for compatibility.
 * App now uses dark theme by default; toggling/light-mode removed.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark() { return true; }
  // no-op methods kept for compatibility
  toggle() {}
  setDark(_: boolean) {}
}
