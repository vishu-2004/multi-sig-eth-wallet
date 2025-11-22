import { WebSocket } from 'ws';

const ws = new WebSocket("wss://eth-sepolia.g.alchemy.com/v2/DzfzB3_V8d2_pdnawXeGO");

ws.on('open', () => console.log("OK"));
ws.on('error', (e) => console.log("ERR", e));
