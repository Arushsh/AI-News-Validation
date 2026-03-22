// src/lib/db/client.ts
// Simple mock database for the MVP to ensure demo stability and instantly cache results.

class MockDatabase {
  private cache: Map<string, any> = new Map();

  async get(key: string) {
    return this.cache.get(key.toLowerCase());
  }

  async set(key: string, value: any) {
    this.cache.set(key.toLowerCase(), {
      result: value,
      timestamp: new Date()
    });
  }
}

export const db = new MockDatabase();
export default db;
