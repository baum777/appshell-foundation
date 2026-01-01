/**
 * Service Worker Type Declarations
 * Provides ServiceWorkerGlobalScope and related types
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Extend the ServiceWorkerGlobalScope if needed
declare interface ServiceWorkerGlobalScope {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  skipWaiting(): Promise<void>;
}
