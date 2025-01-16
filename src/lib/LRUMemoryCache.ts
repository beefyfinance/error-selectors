type LRUMemoryCacheOptions = {
  capacity: number;
  gc?: 'set' | 'interval';
  gcInterval?: number;
};

export class LRUMemoryCache<K, V> extends Map<K, V> {
  private readonly capacity: number;
  private readonly gcOnInterval: number;
  private readonly gcOnSet: boolean;
  private gcIntervalId: Timer | null = null;

  constructor({ capacity, gc = 'set', gcInterval = 30_000 }: LRUMemoryCacheOptions) {
    super();
    this.capacity = capacity;
    this.gcOnInterval = gc === 'interval' ? gcInterval || 30_000 : 0;
    this.gcOnSet = gc === 'set';
  }

  set(key: K, value: V): this {
    this.startInterval();
    if (this.gcOnSet) {
      this.gc();
    }
    return super.set(key, value);
  }

  get(key: K): V | undefined {
    const value = super.get(key);
    if (value === undefined) {
      return value;
    }
    super.delete(key);
    super.set(key, value);
    return value;
  }

  clear(): void {
    this.stopInterval();
    super.clear();
  }

  private startInterval() {
    if (this.gcIntervalId === null && this.gcOnInterval > 0) {
      this.gcIntervalId = setInterval(() => this.gc(), this.gcOnInterval);
    }
  }

  private stopInterval() {
    if (this.gcIntervalId !== null) {
      clearInterval(this.gcIntervalId);
      this.gcIntervalId = null;
    }
  }

  private gc() {
    let toDelete = this.size - this.capacity;
    let key: K | undefined;
    while (toDelete > 0 && (key = this.keys().next().value)) {
      super.delete(key);
      --toDelete;
    }
  }
}