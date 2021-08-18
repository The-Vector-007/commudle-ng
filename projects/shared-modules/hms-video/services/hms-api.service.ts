import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IHmsClient } from 'projects/shared-modules/hms-video/models/hms-client.model';
import { API_ROUTES } from 'projects/shared-services/api-routes.constants';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HmsApiService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  getClientToken(roomId): Observable<IHmsClient> {
    const params = new HttpParams().set('hms_room_id', roomId);

    return this.http.get<IHmsClient>(this.apiRoutesService.getRoute(API_ROUTES.HMS_CLIENT.CLIENT_TOKEN), { params });
  }

  getClientTokenV2(roomId): Observable<IHmsClient> {
    const params = new HttpParams().set('hms_room_id', roomId);

    return this.http.get<IHmsClient>(this.apiRoutesService.getRoute(API_ROUTES.HMS_CLIENT.CLIENT_TOKEN_V2), { params });
  }
}
