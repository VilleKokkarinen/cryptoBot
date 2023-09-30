import { Component } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from './Services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig,
    private settingsService:SettingsService
  ) { }

  public open(modal: any): void {
    this.modalService.open(modal);
  }
}
