import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import app from '../../server.js';

describe('BFF API Endpoints', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    // 啟動一個零時通訊埠的伺服器供測試用
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  // 測auth，auth是假的，測試沒用
  describe('POST /api/rick_auth', () => {
    it('should return 200 success if both account and password exist', async () => {
      const res = await fetch(`${baseUrl}/api/rick_auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'admin', password: '123' })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should return 401 fail if missing credentials', async () => {
      const res = await fetch(`${baseUrl}/api/rick_auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'admin' }) // no password
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  // 測store，store是假的，測試沒用
  describe('POST /api/rick_store', () => {
    it('should return 200 fake store success', async () => {
      const res = await fetch(`${baseUrl}/api/rick_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ power_usage: "123" })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  // 測ocr，這是真的，測試有用。
  describe('POST /api/ocr', () => {
    it('rejects POST /api/ocr gracefully if no file payload is attached', async () => {
      const res = await fetch(`${baseUrl}/api/ocr`, { method: 'POST' });
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('未提供圖片檔案 (No image file provided)');
    });

    it('rejects POST /api/ocr gracefully if missing category', async () => {
      const formData = new FormData();
      const blob = new Blob(["fake image data"], { type: "image/jpeg" });
      formData.append("file", blob, "test.jpg");
      // missing category

      const res = await fetch(`${baseUrl}/api/ocr`, {
        method: 'POST',
        body: formData
      });
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('缺少或無效的票據類型 (Invalid category)');
    });
  });
});
