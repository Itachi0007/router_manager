const axios = require('axios');

const ROUTER_URL = 'https://wifi-admin.netlify.app';

// Token cache
let tokenCache = {
  token: null,
  expiresAt: null
};

// Helper function to authenticate with the router
async function authenticate(username, password) {
  try {
    const config = {
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en-GB;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://wifi-admin.netlify.app/login",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    };

    const response = await axios.post(`${ROUTER_URL}/api/login`, {
      username,
      password
    }, config);

    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from server');
    }

    // Cache the token with expiration (assuming 1 hour expiration)
    tokenCache = {
      token: response.data.token,
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour from now
    };

    return tokenCache.token;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout');
    }
    if (error.response) {
      throw new Error(`Authentication failed: ${error.response.data.message || error.response.statusText}`);
    }
    if (error.request) {
      throw new Error('No response received from server');
    }
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Helper function to get valid token
async function getValidToken(username, password) {
  // Check if we have a valid cached token
  if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  // If no valid token, authenticate to get a new one
  return await authenticate(username, password);
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(token, endpoint, method) {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = method === 'GET' 
      ? await axios.get(`${ROUTER_URL}${endpoint}`, config)
      : await axios.post(`${ROUTER_URL}${endpoint}`, {}, config);

    return response.data;
  } catch (error) {
    // If we get an authentication error, clear the token cache
    if (error.response && error.response.status === 401) {
      tokenCache = { token: null, expiresAt: null };
    }
    console.log(error);
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Router interrogation
exports.interrogateRouter = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const token = await getValidToken(username, password);
    const routerInfo = await makeAuthenticatedRequest(token, '/api/router-config', 'GET');

    // Map the response to the required format
    const response = {
      model: 'N/A',
      firmwareVersion: 'N/A',
      macAddress: routerInfo.connectedDevices?.[0]?.macAddress || 'N/A',
      serialNumber: 'N/A',
      uptime: 'N/A', // If there's no field for uptime, default it
      wifiStatus: routerInfo.wifiSettings?.enabled ? 'enabled' : 'disabled',
      firewallStatus: routerInfo.securitySettings?.firewallEnabled ? 'enabled' : 'disabled'
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle WiFi
exports.toggleWifi = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await getValidToken(username, password);
    
    const response = await makeAuthenticatedRequest(token, '/api/toggle-wifi', 'POST');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Firewall
exports.toggleFirewall = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await getValidToken(username, password);
    
    const response = await makeAuthenticatedRequest(token, '/api/toggle-firewall', 'POST');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generic action handler
exports.performAction = async (req, res) => {
  try {
    const { username, password, action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Username, password, and action are required' });
    }

    const token = await getValidToken(username, password);
    
    let endpoint;
    switch (action) {
      case 'toggle_wifi':
        endpoint = '/api/toggle-wifi';
        break;
      case 'toggle_firewall':
        endpoint = '/api/toggle-firewall';
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await makeAuthenticatedRequest(token, endpoint, 'POST');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 