import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';

import { app } from '../src/app.js';

test('health endpoint returns ok', async () => {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  try {
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Failed to determine test server port');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});