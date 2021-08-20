import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';

// service for hms v2
@Injectable({
  providedIn: 'root',
})
export class LocalMediaV2Service {
  // these are device IDs
  private selectedAudioDevice: BehaviorSubject<any> = new BehaviorSubject(null);
  public selectedAudioDevice$ = this.selectedAudioDevice.asObservable();
  private selectedVideoDevice: BehaviorSubject<any> = new BehaviorSubject(null);
  public selectedVideoDevice$ = this.selectedVideoDevice.asObservable();

  private camera: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public camera$ = this.camera.asObservable();

  private mic: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public mic$ = this.mic.asObservable();

  constructor() {
  }

  getMediaPermission(): Observable<any> {
    return from(navigator.mediaDevices.getUserMedia({audio: true, video: true}));
  }

  getDevices(): Observable<MediaDeviceInfo[]> {
    return from(navigator.mediaDevices.enumerateDevices())
  }

  getLocalStream(constraints) {
    return from(navigator.mediaDevices.getUserMedia(constraints));
  }

  updateAudioDevice(device) {
    this.selectedAudioDevice.next(device);
  }

  updateVideoDevice(device) {
    this.selectedVideoDevice.next(device);
  }

  updateCamera(value) {
    this.camera.next(value)
  }

  updateMic(value) {
    this.mic.next(value);
  }
}
