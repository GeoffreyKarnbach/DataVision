import requests
import json
import paho.mqtt.client as mqtt
import os

def fetch_bim_model(bim_url):
    try:
        response = requests.get(bim_url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching BIM model: {e}")
        return {}

def extract_urls(bim_data):
    objects = []

    for floor in bim_data.get("floors", []):
        for room in floor.get("rooms", []):
            for sensor in room.get("sensors", []):
                name = sensor.get("name")
                td_url = sensor.get("tdUrl")
                topic_url = sensor.get("topicUrl")

                if name and td_url and topic_url:
                    objects.append((
                        name,
                        td_url,
                        topic_url
                    ))
                
    return objects

def get_td_data(td_url):
    try:
        response = requests.get(td_url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching TD data: {e}")
        return {}

def get_hivemq_client(hive_mq_url):
        if hive_mq_url.startswith("mqtt://"):
            hive_mq_url = hive_mq_url[len("mqtt://"):]

        broker_address, broker_port = hive_mq_url.split(":")
        broker_port = int(broker_port)

        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(broker_address, broker_port, 60)

        client.loop_start()

        return client

def loop_forever():
    while True:
        try:
            pass
        except KeyboardInterrupt:
            print("Exiting...")
            break
    
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to HiveMQ broker!")
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    print(f"📨 Received message from {msg.topic}: {str(msg.payload.decode())}")

if __name__ == "__main__":
    with open("config.json", "r") as config_file:
        config = json.load(config_file)

    mode = os.getenv("mode", "dev")
    bim_url = config.get(mode, {}).get("bimUrl")
    hive_mq_url = config.get(mode, {}).get("hiveMqUrl")

    bim_data = fetch_bim_model(bim_url)
    objects = extract_urls(bim_data)
    
    hive_mq_client = get_hivemq_client(hive_mq_url)

    for obj in objects:
        topic_url = obj[2]
        hive_mq_client.subscribe(topic_url)

    loop_forever()

    hive_mq_client.loop_stop()
    hive_mq_client.disconnect()


        