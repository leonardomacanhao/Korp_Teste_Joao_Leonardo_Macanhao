import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Korp - Sistema de Notas Fiscais';

  ngOnInit(): void {
    console.log('AppComponent initialized');
  }
}
