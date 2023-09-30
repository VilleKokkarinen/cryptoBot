import { Component } from '@angular/core';
import { Settings } from 'src/app/components/settings/settings';
import { SettingsService } from 'src/app/Services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  Settings:Settings;

  constructor(private settingsService:SettingsService) {
    this.Settings = settingsService.Settings

    this.settingsService.SettingsChange.subscribe((newSettings)=>{
      this.Settings = newSettings
    })
  }


  SaveSettings(){
    this.settingsService.Settings = this.Settings;
    this.settingsService.SaveSettings();
  }

  ResetSettings(){
    this.settingsService.ResetSettings();
  }
}
