#!/usr/bin/env node
/**
 * Wrapper script for GennyCraft MCP server that reads JWT token from file
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '.gennycraft-token');
const MCP_SERVER_PATH = 'C:\\Users\\hmeln\\source\\repos\\gennycraft-mcp\\build\\index.js';

// Read token from file
let token = '';
try {
  token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
} catch (error) {
  console.error(`Error reading token file: ${TOKEN_FILE}`);
  console.error('Run: python get_jwt_token.py');
  process.exit(1);
}

// Start MCP server with token in environment
const mcp = spawn('node', [MCP_SERVER_PATH], {
  env: {
    ...process.env,
    GENNYCRAFT_API_URL: 'http://localhost:8000/api',
    GENNYCRAFT_JWT_TOKEN: token
  },
  stdio: 'inherit'
});

mcp.on('exit', (code) => {
  process.exit(code);
});
