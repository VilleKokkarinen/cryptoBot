import { EventEmitter, Injectable, Output } from '@angular/core';
import { Settings } from '../components/settings/settings';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  Settings: Settings = this.GetDefaultSettings();

  @Output() SettingsChange = new EventEmitter<Settings>()
  
  constructor(
    private router: Router
  ) {
    this.LoadSettings();
  }
  
  LoadSettings(){
    var Existing = null;

    Existing = JSON.parse(localStorage.getItem('settings')!);

    if(Existing == undefined || Existing == null){
      Existing = this.GetDefaultSettings();
      this.Settings = Existing;
      this.SaveSettings();
      console.log("Reset settings to default, no settings saved in local storage.")
    }else{
      console.log("Loaded settings from localstorage: ", Existing)
    }

    this.Settings = Existing;
    this.SettingsChange.emit(this.Settings);
  }

  GetDefaultSettings(){
    return new Settings();
  }

  SaveSettings(){
    localStorage.setItem('settings', JSON.stringify(this.Settings));
    this.SettingsChange.emit(this.Settings);
  }


  ResetSettings() {
    localStorage.removeItem('settings');
    this.Settings=this.GetDefaultSettings();
    this.SaveSettings();
  }
}
