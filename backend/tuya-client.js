const axios = require('axios');

// Simple Tuya IoT client (minimal, uses env vars)
// Configure these environment variables in your environment or a .env file:
// TUYA_CLIENT_ID, TUYA_CLIENT_SECRET, TUYA_BASE_URL (optional, default https://openapi.tuya.com)

const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET;
const BASE_URL = process.env.TUYA_BASE_URL || 'https://openapi.tuya.com';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('Tuya client: TUYA_CLIENT_ID or TUYA_CLIENT_SECRET not set. Set env vars to enable Tuya API calls.');
}

let tokenCache = {
  accessToken: null,
  expireAt: 0,
};

async function fetchToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('TUYA_CLIENT_ID and TUYA_CLIENT_SECRET must be set');
  }

  // If cached and valid, return it
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expireAt > now + 5000) {
    return tokenCache.accessToken;
  }

  // Note: Tuya has region-specific hosts and auth flows. This implementation
  // assumes the common cloud token endpoint: POST {BASE_URL}/v1.0/token?grant_type=1
  // with JSON body containing client_id and client_secret. If your Tuya docs
  // specify a different request shape (headers/signature), I'll adapt it.

  const url = `${BASE_URL}/v1.0/token?grant_type=1`;
  try {
    const resp = await axios.post(url, {
      // many Tuya examples accept these fields in body
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Expecting response containing access_token and expire_time (seconds)
    const data = resp.data || {};
    // Tuya responses often wrap data in a 'result' or similar; try both
    const result = data.result || data;
    const accessToken = result.access_token || result.token || null;
    const expireIn = result.expire_time || result.expire_in || result.expires_in || 3600;

    if (!accessToken) {
      throw new Error('Token response did not contain access token: ' + JSON.stringify(data));
    }

    tokenCache.accessToken = accessToken;
    tokenCache.expireAt = Date.now() + (expireIn * 1000);
    return accessToken;
  } catch (err) {
    // surface axios errors clearly
    const msg = err.response ? `HTTP ${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
    throw new Error(`Failed to fetch Tuya token: ${msg}`);
  }
}

async function listDevices(pageNo = 1, pageSize = 20) {
  const token = await fetchToken();
  const url = `${BASE_URL}/v1.0/devices`;
  try {
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        // Tuya device listing may accept pagination params; adapt if API differs
        page_no: pageNo,
        page_size: pageSize,
      },
      timeout: 10000,
    });
    return resp.data;
  } catch (err) {
    const msg = err.response ? `HTTP ${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
    throw new Error(`Failed to list Tuya devices: ${msg}`);
  }
}

module.exports = {
  fetchToken,
  listDevices,
};
