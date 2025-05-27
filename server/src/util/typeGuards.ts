import type { WsDataEvent, WsEvent, WsLoginEvent } from '../types';
import type { APIResponse } from '../types/rest';

export function isRawAPIResponse(
  response: unknown,
): response is APIResponse<unknown> {
  if (typeof response !== 'object' || !response) {
    return false;
  }

  if ('code' in response && 'msg' in response && 'data' in response) {
    return true;
  }

  return false;
}

/** Simple type guard that a websocket event extends a known event schema */
export function isWsEvent(evtData: unknown): evtData is WsEvent {
  if (typeof evtData !== 'object' || !evtData) {
    return false;
  }

  if ('event' in evtData) {
    return true;
  }

  return false;
}

export function isWsDataEvent(evtData: unknown): evtData is WsDataEvent {
  if (typeof evtData !== 'object' || !evtData) {
    return false;
  }

  if ('arg' in evtData && 'data' in evtData) {
    return true;
  }
  return false;
}

export function isWsErrorEvent(evt: unknown): boolean {
  return isWsEvent(evt) && evt.event === 'error';
}

/** Usually a response to authenticating over ws */
export function isWsLoginEvent(evt: unknown): evt is WsLoginEvent {
  return isWsEvent(evt) && evt.event === 'login';
}

/** A response to subscribing to a channel */
export function isWsSubscribeEvent(evtData: unknown): boolean {
  return isWsEvent(evtData) && evtData.event === 'subscribe';
}

/** A response to unsubscribing from a channel */
export function isWsUnsubscribeEvent(evtData: unknown): boolean {
  return isWsEvent(evtData) && evtData.event === 'unsubscribe';
}

/** Check if the event is a pong message */
export function isWsPong(evt: unknown): boolean {
  return isWsEvent(evt) && evt.event === 'pong';
}

/** Information event */
export function isConnCountEvent(evtData: unknown): boolean {
  return isWsEvent(evtData) && evtData.event === 'channel-conn-count';
}

/** Simple typescript guard never expecting code to reach it (will throw typescript error if called) */
export function neverGuard(x: never, msg: string): Error {
  return new Error(`Unhandled value exception "${x}", ${msg}`);
}
