import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {IUser} from 'projects/shared-models/user.model';
import {AppUsersService} from 'projects/commudle-admin/src/app/services/app-users.service';
import {Subscription} from 'rxjs';
import {ICurrentUser} from 'projects/shared-models/current_user.model';
import {NbDialogRef, NbDialogService} from '@nebular/theme';
import {LibAuthwatchService} from 'projects/shared-services/lib-authwatch.service';

@Component({
  selector: 'app-user-follow',
  templateUrl: './user-follow.component.html',
  styleUrls: ['./user-follow.component.scss']
})
export class UserFollowComponent implements OnInit, OnDestroy {

  @Input() username: string;

  @Output() userFollowed: EventEmitter<any> = new EventEmitter<any>();

  user: IUser;
  currentUser: ICurrentUser;
  isFollowing = false;

  subscriptions: Subscription[] = [];

  constructor(
    private appUsersService: AppUsersService,
    private authWatchService: LibAuthwatchService,
    private nbDialogService: NbDialogService
  ) {
  }

  ngOnInit(): void {
    this.checkFollowing();

    // Get user's data
    this.subscriptions.push(this.appUsersService.getProfile(this.username).subscribe(data => this.user = data));

    // Get logged in user
    this.subscriptions.push(this.authWatchService.currentUser$.subscribe(data => this.currentUser = data));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(value => value.unsubscribe());
  }

  checkFollowing() {
    if (this.currentUser) {
      this.subscriptions.push(this.appUsersService.check_followee(this.username).subscribe(value => this.isFollowing = value));
    }
  }

  toggleFollow(ref: NbDialogRef<any>) {
    this.subscriptions.push(this.appUsersService.toggleFollow(this.username).subscribe(value => {
      this.checkFollowing();
      ref.close();
      this.userFollowed.emit();
    }));
  }

  openDialog(ref: TemplateRef<any>) {
    this.nbDialogService.open(ref);
  }

}