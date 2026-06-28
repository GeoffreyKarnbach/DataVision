import asyncio
import json
import paho.mqtt.client as mqtt
import websockets
import vdf_utility

connected_clients = set()

def metric_name_from_topic(topic):
    return topic.replace("/", "_").replace("-", "_")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode("utf-8").strip().lower()

    if payload in ["true", "false"]:
        value = 1.0 if payload == "true" else 0.0
    else:
        try:
            value = float(payload)
        except ValueError:
            print(f"Skipping non-numeric payload for topic {topic}: {payload}")
            return

    sensor_type = topic.split("/")[-1]

    meta = userdata['topic_metadata'].get(topic, {})
    floor = meta.get('floor', 'unknown')
    room = meta.get('room', 'unknown')

    data = {
        'topic': topic,
        'floor': floor,
        'room': room,
        'type': sensor_type,
        'value': value,
    }

    asyncio.run_coroutine_threadsafe(
        broadcast(json.dumps(data)),
        userdata['loop']
    )

async def broadcast(message):
    if connected_clients:
        tasks = [client.send(message) for client in connected_clients]
        await asyncio.gather(*tasks)

async def ws_handler(websocket):
    print("TEST")

    print(f"Client connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        async for _ in websocket:
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected: {websocket.remote_address}")

def subscribe_to_topics(client, topics, topic_metadata):
    for topic_config in topics:
        topic = topic_config['topic']
        topic_metadata[topic] = topic_config
        client.subscribe(topic)

async def setup_mqtt_and_ws(configuration):
    loop = asyncio.get_running_loop()  # Get the running event loop

    topics = vdf_utility.get_topics_from_config(configuration)
    mqtt_client = mqtt.Client(userdata={'topic_metadata': {}, 'loop': loop})
    mqtt_client.on_message = on_message

    broker_url = topics[0]['brokerUrl'].replace("mqtt://", "")
    mqtt_client.connect(broker_url.split(":")[0], int(broker_url.split(":")[1]))

    subscribe_to_topics(mqtt_client, topics, mqtt_client._userdata['topic_metadata'])
    mqtt_client.loop_start()

    # Start WebSocket server
    ws_server = await websockets.serve(ws_handler, "0.0.0.0", 8001)

    print("WebSocket server started at ws://0.0.0.0:8001/live-data")
    print("Subscribed to MQTT topics and forwarding data to WebSocket clients.")

    return ws_server, mqtt_client

async def main(config=None):
    if config is None:
        with open("sample_configuration.json", "r") as f:
            config = json.load(f)

    ws_server, mqtt_client = await setup_mqtt_and_ws(config)

    try:
        await asyncio.Future()  # Run forever
    except asyncio.CancelledError:
        print("Shutting down...")
    finally:
        mqtt_client.loop_stop()

if __name__ == "__main__":
    asyncio.run(main())
