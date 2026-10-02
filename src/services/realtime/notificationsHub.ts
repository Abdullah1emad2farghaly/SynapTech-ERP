import * as signalR from '@microsoft/signalr';
import type {
  ReceiveNotificationPayload,
  UnreadCountChangedPayload,
} from '../../types/notification.types';

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

  private receiveListeners =
    new Set<Listener<ReceiveNotificationPayload>>();

  private countListeners =
    new Set<Listener<UnreadCountChangedPayload>>();

  private stateListeners =
    new Set<Listener<ConnectionState>>();

  /**
   * Holds the current connection start promise.
   * Prevents multiple simultaneous start() calls.
   */
  private starting: Promise<void> | null = null;

  /**
   * Used to prevent a connection from being started
   * after logout/explicit stop.
   */
  private stopRequested = false;

  /**
   * Get JWT from localStorage.
   *
   * IMPORTANT:
   * Never log the actual JWT.
   */
  private getAccessToken(): string {
    const accessToken =
      localStorage.getItem('accessToken') ?? '';

    console.log(
      '[notificationsHub] access token exists:',
      Boolean(accessToken)
    );

    return accessToken;
  }

  private emitState(state: ConnectionState): void {
    this.stateListeners.forEach((cb) => {
      try {
        cb(state);
      } catch (error) {
        console.error(
          '[notificationsHub] state listener error:',
          error
        );
      }
    });
  }

  /**
   * Start SignalR connection.
   */
  async start(): Promise<void> {
    /**
     * A new start request means the connection should be active.
     */
    this.stopRequested = false;

    /**
     * Already connected.
     */
    if (
      this.connection?.state ===
      signalR.HubConnectionState.Connected
    ) {
      console.log(
        '[notificationsHub] already connected'
      );

      return;
    }

    /**
     * Already connecting.
     *
     * Reuse the existing promise instead of creating
     * another SignalR connection.
     */
    if (this.starting) {
      console.log(
        '[notificationsHub] connection already starting'
      );

      return this.starting;
    }

    /**
     * If an old connection exists but isn't connected,
     * clean it up before creating a new one.
     */
    if (this.connection) {
      const oldConnection = this.connection;

      this.connection = null;

      try {
        await oldConnection.stop();
      } catch (error) {
        console.warn(
          '[notificationsHub] failed to clean old connection:',
          error
        );
      }
    }

    console.log(
      '[notificationsHub] creating connection'
    );

    const connection =
      new signalR.HubConnectionBuilder()
        .withUrl(NOTIFICATIONS_HUB_URL, {
          accessTokenFactory: () =>
            this.getAccessToken(),
        })
        .withAutomaticReconnect()
        .configureLogging(
          signalR.LogLevel.Information
        )
        .build();

    this.connection = connection;

    /**
     * ReceiveNotification event.
     */
    connection.on(
      'ReceiveNotification',
      (
        payload: ReceiveNotificationPayload
      ) => {
        this.receiveListeners.forEach((cb) => {
          try {
            cb(payload);
          } catch (error) {
            console.error(
              '[notificationsHub] ReceiveNotification listener error:',
              error
            );
          }
        });
      }
    );

    /**
     * UnreadCountChanged event.
     */
    connection.on(
      'UnreadCountChanged',
      (
        payload: UnreadCountChangedPayload
      ) => {
        this.countListeners.forEach((cb) => {
          try {
            cb(payload);
          } catch (error) {
            console.error(
              '[notificationsHub] UnreadCountChanged listener error:',
              error
            );
          }
        });
      }
    );

    /**
     * Connection is attempting to reconnect.
     */
    connection.onreconnecting((error) => {
      console.warn(
        '[notificationsHub] reconnecting:',
        error
      );

      this.emitState('reconnecting');
    });

    /**
     * Connection successfully reconnected.
     */
    connection.onreconnected((connectionId) => {
      console.log(
        '[notificationsHub] reconnected:',
        connectionId
      );

      this.emitState('reconnected');
    });

    /**
     * Connection closed.
     */
    connection.onclose((error) => {
      console.log(
        '[notificationsHub] connection closed',
        error
      );

      /**
       * Only clear the connection if this is still
       * the active connection.
       */
      if (this.connection === connection) {
        this.connection = null;
      }

      this.emitState('disconnected');
    });

    this.emitState('connecting');

    /**
     * Start the connection.
     */
    this.starting = connection
      .start()
      .then(() => {
        /**
         * Check whether stop() was requested while
         * negotiation was happening.
         */
        if (this.stopRequested) {
          console.warn(
            '[notificationsHub] stop was requested during start'
          );

          return;
        }

        /**
         * Make sure this is still the active connection.
         */
        if (this.connection !== connection) {
          console.warn(
            '[notificationsHub] connection replaced during start'
          );

          return;
        }

        console.log(
          '[notificationsHub] connection established'
        );

        this.emitState('connected');
      })
      .catch((error) => {
        /**
         * Ignore the expected AbortError caused by
         * intentionally stopping the connection.
         */
        if (
          error instanceof Error &&
          error.name === 'AbortError' &&
          this.stopRequested
        ) {
          console.log(
            '[notificationsHub] connection start cancelled'
          );

          return;
        }

        console.error(
          '[notificationsHub] connection failed:',
          error
        );

        this.emitState('error');

        /**
         * Clear failed connection.
         */
        if (this.connection === connection) {
          this.connection = null;
        }

        /**
         * Re-throw unexpected errors so callers can
         * handle them if needed.
         */
        throw error;
      })
      .finally(() => {
        this.starting = null;
      });

    return this.starting;
  }

  /**
   * Stop SignalR connection.
   *
   * This should normally be called during logout,
   * application shutdown, or when you intentionally
   * want to disconnect the notification system.
   */
  async stop(): Promise<void> {
    console.log(
      '[notificationsHub] stop() requested'
    );

    /**
     * Tell start() that the stop was intentional.
     */
    this.stopRequested = true;

    /**
     * If a connection is currently starting,
     * wait for its start promise before stopping it.
     *
     * This prevents:
     *
     * start()
     *   ↓
     * negotiate
     *   ↓
     * stop()
     *   ↓
     * AbortError
     */
    if (this.starting) {
      console.log(
        '[notificationsHub] waiting for connection start to finish'
      );

      try {
        await this.starting;
      } catch {
        /**
         * Ignore start errors here because stop()
         * is intentionally shutting down the connection.
         */
      }
    }

    const connection = this.connection;

    if (!connection) {
      console.log(
        '[notificationsHub] no active connection'
      );

      this.emitState('disconnected');

      return;
    }

    /**
     * Clear reference before stopping.
     */
    this.connection = null;

    try {
      await connection.stop();

      console.log(
        '[notificationsHub] connection stopped'
      );
    } catch (error) {
      console.error(
        '[notificationsHub] failed to stop connection:',
        error
      );
    }

    this.emitState('disconnected');
  }

  /**
   * Subscribe to incoming notifications.
   *
   * Returns an unsubscribe function.
   */
  onReceive(
    cb: Listener<ReceiveNotificationPayload>
  ): () => void {
    this.receiveListeners.add(cb);

    return () => {
      this.receiveListeners.delete(cb);
    };
  }

  /**
   * Subscribe to unread count changes.
   *
   * Returns an unsubscribe function.
   */
  onUnreadCountChanged(
    cb: Listener<UnreadCountChangedPayload>
  ): () => void {
    this.countListeners.add(cb);

    return () => {
      this.countListeners.delete(cb);
    };
  }

  /**
   * Subscribe to connection state changes.
   *
   * Returns an unsubscribe function.
   */
  onStateChange(
    cb: Listener<ConnectionState>
  ): () => void {
    this.stateListeners.add(cb);

    return () => {
      this.stateListeners.delete(cb);
    };
  }

  /**
   * Returns the current SignalR state.
   */
  getState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }

  /**
   * Returns whether SignalR is currently connected.
   */
  isConnected(): boolean {
    return (
      this.connection?.state ===
      signalR.HubConnectionState.Connected
    );
  }
}

/**
 * Singleton instance.
 */
export const notificationsHub =
  new NotificationsHubManager();
