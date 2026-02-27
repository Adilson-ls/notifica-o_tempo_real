const request = require('supertest');

// Tests assume server is already running on http://localhost:3000

describe('API basic endpoints', () => {
  it('GET /api/notifications should return 200 and array', async () => {
    const res = await request('http://localhost:3000').get('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/notify without auth should be rejected', async () => {
    const res = await request('http://localhost:3000')
      .post('/api/notify')
      .send({ title: 'Test', message: 'Hello' });
    expect([401,403]).toContain(res.statusCode);
  });
});
