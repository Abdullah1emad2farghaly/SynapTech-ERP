// src/types/notification.types.ts

/**
 * ASSUMPTION: The provided Swagger contract only confirms `NotificationResponse[]`
 * as a return type — it does not expose the schema's fields. The shape below is a
 * best-guess based on conventional ERP notification payloads and MUST be swapped
 * for the real interface before this compiles cleanly against live data.
 *
 * The ONLY thing genuinely confirmed by the contract is that each notification
 * has some identifier usable in:
 *   POST /api/notifications/{id}/mark-read
 *   DELETE /api/notifications/{id}
 * That identifier is assumed to be `id: string` (UUID) below — this part is safe.
 *
 * Everything else (title, message, type, isRead, createdAt, priority, readAt) is
 * UNCONFIRMED. Every component in this module reads these fields defensively
 * (optional chaining + fallbacks) specifically so that once you swap in the real
 * type, missing/renamed fields degrade gracefully instead of crashing.
 */
export interface NotificationResponse {
  /** CONFIRMED — used as the route param for mark-read/delete */
  id: string;
  // --- everything below is ASSUMPTION, verify against real backend type ---
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link: string;
}

export interface GetNotificationsParams {
  unreadOnly?: boolean;
}

/** Payload shape SignalR's `ReceiveNotification` event is assumed to send —
 *  same caveat as NotificationResponse above. */
export type ReceiveNotificationPayload = NotificationResponse;

/** Payload shape SignalR's `UnreadCountChanged` event is assumed to send. */
export type UnreadCountChangedPayload = number;
