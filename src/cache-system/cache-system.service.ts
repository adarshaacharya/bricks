import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Redis, { RedisKey, RedisValue } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

export type TCacheKey = string;
export type TCacheResult<T> = Promise<T | undefined>;
export const CACHE_DEFAULT_TTL = 60 * 2;

@Injectable()
export class CacheSystemService {
  options = new Map<string, any>();
  private readonly redis: Redis;

  constructor(private readonly cache: RedisService) {
    this.redis = this.cache.getClient();
  }

  /**
   * Retrieve a value from the cache based on the specified key.
   */
  async get<T>(key: RedisKey): TCacheResult<T> {
    const res = await this.redis.get(key);
    if (!res) return undefined;
    return (await JSON.parse(res)) satisfies T;
  }

  /**
   * Set a value in the cache with the specified key and time-to-live (TTL) in seconds.
   */
  async set(
    key: RedisKey,
    value: any,
    ttl: string | number = CACHE_DEFAULT_TTL,
  ) {
    const redisValue: RedisValue = JSON.stringify(value);
    return await this.redis.set(key, redisValue, 'EX', ttl);
  }

  /**
   * Delete keys from the cache that match a specified pattern.
   *
   * @param pattern - The pattern of keys to delete.
   * @returns A promise that resolves to `true` if the keys were successfully deleted, or `false` if
   *   not.
   * @throws HttpException if the pattern is not provided, or there is an error deleting keys.
   */
  async invalidateCache(pattern: string) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return false;

      const deleteKeys = await this.redis.del(...keys);
      if (deleteKeys !== keys.length) return false;

      return true;
    } catch (e) {
      console.log('error from invalidateCache', e);
      throw new HttpException('error deleting keys', HttpStatus.BAD_REQUEST);
    }
  }

  async clearCache() {
    return await this.redis.flushall();
  }
}
