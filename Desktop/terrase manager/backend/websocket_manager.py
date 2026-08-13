import json
from typing import List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] New tablet connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket] Tablet disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: dict):
        payload = json.dumps({"event": event_type, "data": data})
        print(f"[WebSocket] Broadcasting '{event_type}' to {len(self.active_connections)} client(s)...")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                print(f"[WebSocket] Error broadcasting to client: {e}")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()
