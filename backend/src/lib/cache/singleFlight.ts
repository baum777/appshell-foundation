import { logger } from '../../observability/logger.js';

type FlightFn<T> = () => Promise<T>;

export class SingleFlight {
  private flights = new Map<string, Promise<any>>();

  /**
   * Execute the given function once for the given key.
   * Concurrent calls with the same key will wait for the first call to complete.
   */
  async do<T>(key: string, fn: FlightFn<T>): Promise<T> {
    const existing = this.flights.get(key);
    if (existing) {
      logger.debug('SingleFlight hit', { key });
      return existing;
    }

    const promise = fn()
      .then((result) => {
        this.flights.delete(key);
        return result;
      })
      .catch((err) => {
        this.flights.delete(key);
        throw err;
      });

    this.flights.set(key, promise);
    return promise;
  }
}

export const singleFlight = new SingleFlight();

