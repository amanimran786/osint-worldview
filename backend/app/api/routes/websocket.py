"""WebSocket endpoint for real-time signal notifications."""
import asyncio
import json
import logging
from typing import Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages active WebSocket connections for real-time broadcasting."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info("WS client connected (%d total)", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info("WS client disconnected (%d total)", len(self.active_connections))

    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        if not self.active_connections:
            return
        payload = json.dumps(message)
        dead: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead.append(connection)
        for ws in dead:
            self.active_connections.discard(ws)


# Singleton manager
manager = ConnectionManager()


@router.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    """WebSocket endpoint for real-time signal updates.

    Clients connect here to receive:
    - new_signal: when a new signal is ingested
    - signal_update: when a signal status changes
    - poll_complete: when a feed poll finishes
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; clients can send ping/commands
            data = await websocket.receive_text()
            # Echo back a heartbeat
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


async def broadcast_new_signal(signal_data: dict):
    """Called by ingest logic to notify all connected clients."""
    await manager.broadcast({
        "type": "new_signal",
        "data": signal_data,
    })


async def broadcast_signal_update(signal_id: int, status: str):
    """Called when a signal status is updated."""
    await manager.broadcast({
        "type": "signal_update",
        "data": {"id": signal_id, "status": status},
    })


async def broadcast_poll_complete(new_count: int):
    """Called when a feed poll completes."""
    await manager.broadcast({
        "type": "poll_complete",
        "data": {"new_signals": new_count},
    })
