

import * as signalR from '@microsoft/signalr';
import type {
  ReceiveNotificationPayload,
  UnreadCountChangedPayload,
} from '../../types/notification.types';

// ASSUMPTION: swap for wherever the project keeps its API base URL constant.
const NOTIFICATIONS_HUB_URL =
  'https://synaptecherp.runasp.net/hubs/notifications';

type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'reconnected'
  | 'disconnected'
  | 'error';

type Listener<T> = (payload: T) => void;


class NotificationsHubManager {
  private connection: signalR.HubConnection | null = null;
  private receiveListeners = new Set<Listener<ReceiveNotificationPayload>>();
  private countListeners = new Set<Listener<UnreadCountChangedPayload>>();
  private stateListeners = new Set<Listener<ConnectionState>>();
  private starting: Promise<void> | null = null;

  /** CONFIRMED — the real project stores the JWT as `accessToken` in
   *  localStorage, read directly (per the project's own SignalR example). */
  private getAccessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  private emitState(state: ConnectionState) {
    this.stateListeners.forEach((cb) => cb(state));
  }

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;
    if (this.starting) return this.starting;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATIONS_HUB_URL, {
        accessTokenFactory: () => this.getAccessToken(),
      })
      .withAutomaticReconnect()
      .build();

    // Registered once per connection instance, not per subscriber, so
    // reconnects never duplicate event delivery to consumers.
    this.connection.on('ReceiveNotification', (payload: ReceiveNotificationPayload) => {
      this.receiveListeners.forEach((cb) => cb(payload));
    });
    this.connection.on('UnreadCountChanged', (payload: UnreadCountChangedPayload) => {
      this.countListeners.forEach((cb) => cb(payload));
    });

    this.connection.onreconnecting(() => this.emitState('reconnecting'));
    this.connection.onreconnected(() => this.emitState('reconnected'));
    this.connection.onclose(() => this.emitState('disconnected'));

    this.emitState('connecting');
    this.starting = this.connection
      .start()
      .then(() => this.emitState('connected'))
      .catch((err) => {
        this.emitState('error');
        // Swallow — callers shouldn't spam a toast per the brief; log for
        // diagnostics only.
        console.error('[notificationsHub] connection failed', err);
      })
      .finally(() => {
        this.starting = null;
      });

    return this.starting;
  }

  async stop(): Promise<void> {
    if (!this.connection) return;
    await this.connection.stop();
    this.connection = null;
    this.emitState('disconnected');
  }

  onReceive(cb: Listener<ReceiveNotificationPayload>) {
    this.receiveListeners.add(cb);
    return () => this.receiveListeners.delete(cb);
  }

  onUnreadCountChanged(cb: Listener<UnreadCountChangedPayload>) {
    this.countListeners.add(cb);
    return () => this.countListeners.delete(cb);
  }

  onStateChange(cb: Listener<ConnectionState>) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }
}

export const notificationsHub = new NotificationsHubManager();

// ASSUMPTION: call `notificationsHub.stop()` from wherever the project's
// existing logout flow lives (e.g. authStore's logout action or an axios 401
// interceptor redirect), so the connection doesn't outlive the session.
