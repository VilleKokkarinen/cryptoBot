import { Component } from '@angular/core';
import { LoadingSpinnerService } from 'src/app/Services/loading-spinner.service';

@Component({
  selector: 'app-small-spinner',
  templateUrl: './small-spinner.component.html',
  styleUrls: ['./small-spinner.component.css']
})
export class SmallLoadingSpinner {
  constructor(public loader: LoadingSpinnerService) { }
}
