import { Component } from '@angular/core';
import { ODataClient } from 'src/clients/generatedCode-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public client: ODataClient) {
  }
}
