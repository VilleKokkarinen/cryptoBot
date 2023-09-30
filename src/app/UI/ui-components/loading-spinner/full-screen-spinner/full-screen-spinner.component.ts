import { Component } from '@angular/core';
import { LoadingSpinnerService } from 'src/app/Services/loading-spinner.service';

@Component({
  selector: 'app-full-screen-spinner',
  templateUrl: './full-screen-spinner.component.html',
  styleUrls: ['./full-screen-spinner.component.css']
})
export class FullScreenSpinnerComponent {
  constructor(public loader: LoadingSpinnerService) { }
}
