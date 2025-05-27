import { NextResponse } from 'next/server';
import { WebSocket } from 'ws';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Get the WebSocket upgrade header
  const upgradeHeader = request.headers.get('upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new NextResponse('Expected WebSocket upgrade', { status: 426 });
  }
  
  // Get the WebSocket key from headers
  const webSocketKey = request.headers.get('sec-websocket-key');
  if (!webSocketKey) {
    return new NextResponse('Missing WebSocket key', { status: 400 });
  }
  
  // Create a response that will be used to upgrade the connection
  const { socket, response } = await new Promise<{ socket: any; response: NextResponse }>((resolve) => {
    // Create a WebSocket server
    const wsServer = new WebSocket.Server({ noServer: true });
    
    // Handle WebSocket upgrade
    const response = new NextResponse(null, {
      status: 101,
      webSocket: null,
    });
    
    // @ts-ignore - The WebSocket server is attached to the HTTP server
    wsServer.handleUpgrade(
      request,
      // @ts-ignore - The WebSocket server is attached to the HTTP server
      request.socket,
      Buffer.alloc(0),
      (ws) => {
        console.log('WebSocket client connected');
        
        // Connect to the OKX WebSocket server
        const okxWs = new WebSocket('ws://localhost:3001/ws');
        
        okxWs.on('open', () => {
          console.log('Connected to OKX WebSocket server');
        });
        
        okxWs.on('message', (data: Buffer) => {
          console.log('Received message from OKX:', data.toString());
          if (ws.readyState === ws.OPEN) {
            ws.send(data.toString());
          }
        });
        
        okxWs.on('close', () => {
          console.log('Disconnected from OKX WebSocket server');
          if (ws.readyState === ws.OPEN) {
            ws.close();
          }
        });
        
        okxWs.on('error', (error: Error) => {
          console.error('OKX WebSocket error:', error);
          if (ws.readyState === ws.OPEN) {
            ws.close();
          }
        });
        
        // Handle messages from the client
        ws.on('message', (data: Buffer) => {
          console.log('Received message from client:', data.toString());
          if (okxWs.readyState === WebSocket.OPEN) {
            okxWs.send(data);
          }
        });
        
        // Handle client disconnection
        ws.on('close', () => {
          console.log('Client disconnected');
          okxWs.close();
        });
        
        // Handle client errors
        ws.on('error', (error: Error) => {
          console.error('Client WebSocket error:', error);
          okxWs.close();
        });
      }
    );
    
    // @ts-ignore - The WebSocket server is attached to the HTTP server
    response.webSocket = wsServer;
    
    resolve({
      socket: null,
      response,
    });
  });
  
  return response;
}
