import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
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