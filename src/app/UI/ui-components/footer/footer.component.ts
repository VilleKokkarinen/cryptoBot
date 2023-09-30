import { Component } from '@angular/core';
import { Settings } from 'src/app/components/settings/settings';
import { SettingsService } from 'src/app/Services/settings.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  Settings:Settings;
  
  constructor(private settingsService:SettingsService){
    this.Settings = this.settingsService.Settings,
    this.settingsService.SettingsChange.subscribe((newSettings)=>{
      this.Settings = newSettings;
    })
  }
}
