import { Component } from '@angular/core';
import { Settings } from 'src/app/components/settings/settings';
import { SettingsService } from 'src/app/Services/settings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  version:string = "";
  DropdownOpen:boolean = false;
  
  Settings:Settings;
  
  constructor(private settingsService:SettingsService){
    this.version = "V: " + environment.version.major.toString() + "." +  environment.version.minor;
    this.Settings = this.settingsService.Settings

    this.settingsService.SettingsChange.subscribe((data) => {
      this.Settings = data;
    })
  }
  
}
