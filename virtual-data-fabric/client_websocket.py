import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:8001"
    async with websockets.connect(uri) as websocket:
        print("✅ Connected to WebSocket")

        try:
            while True:
                message = await websocket.recv()
                print("📩 Received:", message)
        except websockets.exceptions.ConnectionClosed as e:
            print(f"❌ Connection closed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())