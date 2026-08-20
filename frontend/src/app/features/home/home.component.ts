import { Component } from '@angular/core';
import { APPLICATION_CONFIG } from '../../core/config/application.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly app = APPLICATION_CONFIG;

  updateCardGlow(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();

    card.style.setProperty(
      '--mx',
      `${((event.clientX - rect.left) / rect.width) * 100}%`
    );

    card.style.setProperty(
      '--my',
      `${((event.clientY - rect.top) / rect.height) * 100}%`
    );
  }
}
