import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { EventEntryPassesService } from 'projects/commudle-admin/src/app/services/event-entry-passes.service';
import { ICommunity } from 'projects/shared-models/community.model';
import { IEventPass } from 'projects/shared-models/event-pass.model';
import { IEvent } from 'projects/shared-models/event.model';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { SeoService } from 'projects/shared-services/seo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-entry-pass-scan',
  templateUrl: './entry-pass-scan.component.html',
  styleUrls: ['./entry-pass-scan.component.scss'],
})
export class EntryPassScanComponent implements OnInit, OnDestroy {
  @ViewChild('scanner', { static: false }) scanner: ZXingScannerComponent;
  @ViewChild('correctSound') correctSound: ElementRef;
  @ViewChild('incorrectSound') incorrectSound: ElementRef;
  @ViewChild('userInfo') userInfo: TemplateRef<any>;

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  lastDevice: MediaDeviceInfo = null;
  hasDevices: boolean;
  hasPermission: boolean;
  qrResultString: string;
  eventPass: IEventPass = null;
  event: IEvent;
  community: ICommunity;
  attendanceStatus: boolean = false;

  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  entryPassForm = this.fb.group({
    entry_pass_code: ['', Validators.required],
  });

  subscriptions: Subscription[] = [];

  windowRef: NbWindowRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastService: LibToastLogService,
    private eventEntryPassesService: EventEntryPassesService,
    private fb: FormBuilder,
    private seoService: SeoService,
    private windowService: NbWindowService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.data.subscribe((val) => {
        this.event = val.event;
        this.community = val.community;
      }),
    );

    this.seoService.noIndex(true);
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onCodeResult(resultString: string) {
    this.lastDevice = this.scanner.device;
    this.scanner.enable = false;
    this.getEntryPass(this.event.id, resultString);
  }

  submitForm() {
    this.lastDevice = this.scanner.device;
    this.scanner.enable = false;
    this.getEntryPass(this.event.id, this.entryPassForm.value.entry_pass_code);
  }

  getEntryPass(eventId: number, uniqueCode: string) {
    this.subscriptions.push(
      this.eventEntryPassesService.getEntryPass(eventId, uniqueCode).subscribe((data) => {

        if (data.attendance) {
          this.toastService.warningDialog('Attendance already marked')
        }
        this.correctSound.nativeElement.play();
        this.eventPass = data;
        this.windowRef = this.windowService.open(this.userInfo, { windowClass: 'user-info', });
        
        this.subscriptions.push(
          this.windowRef.onClose.subscribe(() => {
            this.scanner.device = this.lastDevice;
            this.currentDevice = this.lastDevice;
            this.scanner.enable = true;
          })
        )
      }, (err) => {
        if(err){
          this.incorrectSound.nativeElement.play();
          this.resetScanner();
        }
      })
    );
  }

  closeWindow() {
    this.windowRef.close();
  }

  toggleAttendance() {
    this.attendanceStatus = true;
    this.subscriptions.push(
      this.eventEntryPassesService.toggleAttendance(this.eventPass.id).subscribe((res) => {
        if (res) {
          this.toastService.successDialog('Attendance Toggled');
          this.attendanceStatus = false;
          this.windowRef.close();
        }
      }),
    );
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    // checks whether user has camera devices or not
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    // when user changes the camera
    const device = this.availableDevices.find((x) => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  compareByDeviceId(optionValue, selectedValue): boolean {
    return optionValue === selectedValue.deviceId;
  }

  resetScanner(){
    if(!this.scanner.enabled){
      this.scanner.device = this.lastDevice;
      this.currentDevice = this.lastDevice;
      this.scanner.enable = true;
    }
  }
}