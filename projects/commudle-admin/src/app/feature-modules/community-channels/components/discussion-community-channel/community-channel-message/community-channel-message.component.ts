import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NbMenuService, NbWindowRef, NbWindowService } from '@nebular/theme';
import { Match } from 'autolinker';
import * as moment from 'moment';
import { environment } from 'projects/commudle-admin/src/environments/environment';
import { ICurrentUser } from 'projects/shared-models/current_user.model';
import { EUserRoles } from 'projects/shared-models/enums/user_roles.enum';
import { IUserMessage } from 'projects/shared-models/user_message.model';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { CommunityChannelsService } from 'projects/commudle-admin/src/app/feature-modules/community-channels/services/community-channels.service';
import { CommunityChannelManagerService } from 'projects/commudle-admin/src/app/feature-modules/community-channels/services/community-channel-manager.service';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';

@Component({
  selector: 'app-community-channel-message',
  templateUrl: './community-channel-message.component.html',
  styleUrls: ['./community-channel-message.component.scss'],
})
export class CommunityChannelMessageComponent implements OnInit, OnChanges, OnDestroy {
  EUserRoles = EUserRoles;
  @ViewChild('editMessageTemplate', { static: true }) editMessageTemplate: TemplateRef<any>;

  @Input() message: IUserMessage;
  @Input() canReply: boolean;
  @Input() roles = [];
  @Input() permittedActions;
  @Input() allActions;
  @Input() currentUser: ICurrentUser;
  @Input() lineClamp: boolean = false;
  @Input() showMessageControls: boolean = true;
  @Input() showPin: boolean = true;
  @Output() sendReply = new EventEmitter();
  @Output() sendAttachmentReply = new EventEmitter();
  @Output() sendUpdatedReply = new EventEmitter();
  @Output() sendUpdatedAttachmentReply = new EventEmitter();
  @Output() sendFlag = new EventEmitter();
  @Output() sendDelete = new EventEmitter();
  @Output() sendMessageByEmail = new EventEmitter();

  canEdit = false;
  editMode = false;
  isAdmin = false;
  canDelete = false;
  canSendMessageByEmail = false;
  canPinMessage = false;

  editMessageTemplateRef: NbWindowRef;

  subscriptions: Subscription[] = [];

  moment = moment;

  showReplyForm = false;

  contextMenuItems = [];

  faThumbtack = faThumbtack;

  constructor(
    private authWatchService: LibAuthwatchService,
    private menuService: NbMenuService,
    private nbWindowService: NbWindowService,
    private activatedRoute: ActivatedRoute,
    private communityChannelsService: CommunityChannelsService,
    private communityChannelManagerService: CommunityChannelManagerService,
    private libToastLogService: LibToastLogService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());

    this.subscriptions.push(
      this.authWatchService.currentUser$.subscribe((data) => {
        this.currentUser = data;
        if (this.currentUser) {
          if (this.roles) {
            this.isAdmin = this.roles.includes(EUserRoles.COMMUNITY_CHANNEL_ADMIN);
          }

          if (!this.canEdit && this.currentUser.username === this.message.user.username) {
            this.canEdit = true;
            this.contextMenuItems.push({
              title: 'Edit',
            });
          }
          if (!this.canDelete && (this.isAdmin || this.currentUser.username === this.message.user.username)) {
            this.canDelete = true;
            this.contextMenuItems.push({
              title: 'Delete',
            });
          }
          if (this.isAdmin && !this.canSendMessageByEmail) {
            this.canSendMessageByEmail = true;
            this.contextMenuItems.push({
              title: 'Email to all members',
            });
          }
          if (!this.canPinMessage && (this.isAdmin || this.currentUser.username === this.message.user.username)) {
            this.canPinMessage = true;
            this.contextMenuItems.push({
              title: this.message.pinned ? 'Unpin Message' : 'Pin Message',
            });
          }
        }
      }),
    );

    this.handleContextMenu();
    this.togglePinStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  login(): boolean {
    if (!this.currentUser) {
      this.authWatchService.logInUser();
    }
    return true;
  }

  emitDelete(userMessageId): void {
    this.sendDelete.emit(userMessageId);
  }

  emitReply(data): void {
    this.sendReply.emit(data);
  }

  emitAttachmentReply(data): void {
    this.sendAttachmentReply.emit(data);
  }

  emitUpdate(data, userMessageId?: number): void {
    if (userMessageId) {
      this.sendUpdatedReply.emit([data, userMessageId]);
    } else {
      this.sendUpdatedReply.emit(data);
    }
    this.editMessageTemplateRef?.close();
  }

  emitAttachmentUpdate(data, userMessageId?: number): void {
    if (userMessageId) {
      this.sendUpdatedAttachmentReply.emit([data, userMessageId]);
    } else {
      this.sendUpdatedAttachmentReply.emit(data);
    }
    this.editMessageTemplateRef?.close();
  }

  toggleReplyForm(): void {
    this.showReplyForm = !this.showReplyForm;
  }

  emitSendMessageByEmail(messageId): void {
    this.sendMessageByEmail.emit(messageId);
  }

  handleContextMenu(): void {
    this.subscriptions.push(
      this.menuService
        .onItemClick()
        .pipe(
          filter(({ tag }) => tag === `community-channel-message-menu-${this.message.id}`),
          map(({ item: title }) => title),
        )
        .subscribe((menuItem) => {
          switch (menuItem.title) {
            case 'Edit': {
              this.openEditForm();
              break;
            }
            case 'Delete': {
              this.login() && this.emitDelete(this.message.id);
              break;
            }
            case 'Email to all members': {
              this.sendMessageByEmail.emit(this.message.id);
              break;
            }
            case 'Pin Message': {
              let channelId = this.activatedRoute.snapshot.params.community_channel_id;
              this.subscriptions.push(
                this.communityChannelsService.pinMessage(this.message.id, channelId).subscribe(() => {
                  this.libToastLogService.successDialog('Pinned Message Successfully!');
                }),
              );
              break;
            }
            case 'Unpin Message': {
              let channelId = this.activatedRoute.snapshot.params.community_channel_id;
              this.subscriptions.push(
                this.communityChannelsService.unpinMessage(this.message.id, channelId).subscribe(() => {
                  this.libToastLogService.successDialog('Unpinned Message Successfully!');
                }),
              );
              break;
            }
          }
        }),
    );
  }

  togglePinStatus() {
    this.subscriptions.push(
      this.communityChannelManagerService.pinData$.subscribe((data) => {
        if (data) {
          switch (data.action) {
            case 'pin': {
              this.pinMessage(data.user_message);
              break;
            }
            case 'unpin': {
              this.unpinMessage(data.user_message);
              break;
            }
          }
        }
      }),
    );
  }

  pinMessage(message: IUserMessage) {
    if (message.id === this.message.id) {
      this.message.pinned = true;
      const idx = this.contextMenuItems.findIndex((item) => item.title === 'Pin Message');
      if (idx !== -1) {
        this.contextMenuItems[idx].title = 'Unpin Message';
      }
    }
  }

  unpinMessage(message: IUserMessage) {
    if (message.id === this.message.id) {
      this.message.pinned = false;
      const idx = this.contextMenuItems.findIndex((item) => item.title === 'Unpin Message');
      if (idx !== -1) {
        this.contextMenuItems[idx].title = 'Pin Message';
      }
    }
  }

  openEditForm(): void {
    this.editMessageTemplateRef = this.nbWindowService.open(this.editMessageTemplate, {
      title: 'Edit your message',
      windowClass: 'remove-overflow-mention',
    });
  }

  highlightUserMentions(match: Match): string {
    switch (match.getType()) {
      case 'mention':
        return `<a href="${environment.app_url}/users/${match
          .getMatchedText()
          .slice(1)}" target="_blank">${match.getMatchedText()}</a>`;
    }
  }
}
