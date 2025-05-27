import type { WsKey } from './websocket-util';

export type WsTopic = string;

export enum WsConnectionStateEnum {
  INITIAL = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  CLOSING = 3,
  RECONNECTING = 4,
}

export interface WsStoredState<T = string | WsChannelSubUnSubRequestArg> {
  ws?: WebSocket;
  connectionState: WsConnectionStateEnum;
  activePingTimer?: NodeJS.Timeout;
  activePongTimer?: NodeJS.Timeout;
  activeReconnectTimer?: NodeJS.Timeout;
  pendingTopics: T[];
  subscribedTopics: T[];
  lastMessageTimestamp?: number;
  lastPingTimestamp?: number;
  lastPongTimestamp?: number;
}

export interface WsChannelSubUnSubRequestArg {
  channel: string;
  instId?: string;
  instFamily?: string;
  [key: string]: any;
}

export const PUBLIC_WS_KEYS: WsKey[] = []; // Add actual public keys if needed

// Mock implementation for missing functions
export function getWsKeyForTopicChannel(
  _market: any,
  _channel: any,
  _isPrivate?: boolean,
): WsKey {
  return 'prodPublic' as WsKey;
}

export function getWsUrlForWsKey(
  _wsKey: any,
  _wsClientOptions: any,
  _logger: any,
): string {
  return '';
}

export function getMaxTopicsPerSubscribeEvent(_market: any): number | null {
  return 100;
}

export function isDeepObjectMatch(object1: unknown, object2: unknown): boolean {
  // If both are null or undefined, they match
  if (object1 === null || object1 === undefined) {
    return object2 === null || object2 === undefined;
  }
  
  // If one is null/undefined and the other isn't, they don't match
  if (object2 === null || object2 === undefined) {
    return false;
  }

  // If types are different, they don't match
  if (typeof object1 !== typeof object2) {
    return false;
  }

  // Handle non-object types
  if (typeof object1 !== 'object' || object1 === null) {
    return object1 === object2;
  }

  // Both are objects, compare their properties
  const obj1 = object1 as Record<string, unknown>;
  const obj2 = object2 as Record<string, unknown>;
  
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();

  // Different number of keys means they don't match
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys in object1 exist in object2 with matching values
  for (const key of keys1) {
    if (!(key in obj2)) {
      return false;
    }
    
    // Recursively compare nested objects
    if (!isDeepObjectMatch(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export function isConnCountEvent(evtData: any): boolean {
  return false;
}

