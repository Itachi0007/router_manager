# WiFi Manager Service

A Node.js service for interacting with router web interfaces, providing endpoints to retrieve router information and control various settings.

## Features

- Router interrogation (get device metadata)
- WiFi control (enable/disable)
- Firewall control (enable/disable)
- Authentication handling
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The service will start on port 3000 by default.

## API Endpoints

### 1. Router Interrogation
- **POST** `/api/router/interrogate`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```
- **Response:**
```json
{
  "model": "XYZ123",
  "firmwareVersion": "v2.3.4",
  "macAddress": "00:11:22:33:44:55",
  "serialNumber": "SN123456",
  "uptime": "5 days",
  "wifiStatus": "enabled",
  "firewallStatus": "disabled"
}
```
If any value if not present in the router we will return N/A.

### 2. WiFi Control
- **POST** `/api/router/wifi/toggle`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

- **Response Body:**
```json
{
    "message": "WiFi enabled successfully",
    "wifiEnabled": true
}
```

### 3. Firewall Control
- **POST** `/api/router/firewall/toggle`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```
- **Request Body:**
```json
{
    "message": "Firewall enabled successfully",
    "wifiEnabled": true
}
```

### 4. Generic Action
- **POST** `/api/router/action`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "admin",
  "action": "toggle_wifi" // or "toggle_wifi", "toggle_firewall"
}
```

## Tokens are being cached for bypassing authentication flow for each subsequent request

## Error Handling

The service includes comprehensive error handling for:
- Authentication failures
- Invalid requests
- Network errors
- Missing required fields

All errors are returned with appropriate HTTP status codes and error messages.

## Security

- All endpoints require authentication
- Passwords are never stored
- HTTPS is recommended for production use
- CORS is enabled for cross-origin requests 