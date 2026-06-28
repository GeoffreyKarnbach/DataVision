from prometheus_client import start_http_server, Gauge, REGISTRY
import paho.mqtt.client as mqtt
import json
from vdf_utility import get_topics_from_config

mqtt_client = None
gauges = {}

def metric_name_from_topic(topic):
    return topic.replace("/", "_").replace("-", "_")

def on_message(client, userdata, msg):
    
    topic = msg.topic
    payload = msg.payload.decode("utf-8").strip().lower()
    print(topic, payload)
    
    if payload in ["true", "false"]:
        value = 1.0 if payload == "true" else 0.0
    else:
        try:
            value = float(payload)
        except ValueError:
            print(f"Skipping non-numeric payload for topic {topic}: {payload}")
            return

    metric_name = metric_name_from_topic(topic)
    sensor_type = topic.split("/")[-1]

    if metric_name not in gauges:
        gauges[metric_name] = Gauge(
            metric_name,
            'Sensor value',
            ['floor', 'room', 'type', 'topic']
        )

    meta = userdata['topic_metadata'].get(topic)
    if meta:
        gauges[metric_name].labels(
            meta['floor'],
            meta['room'],
            sensor_type,
            topic
        ).set(value)
    
def subscribe_to_topics(client, topics, topic_metadata):
    for topic_config in topics:
        topic = topic_config['topic']
        topic_metadata[topic] = topic_config
        client.subscribe(topic)

def setup_instance(configuration):
    global mqtt_client

    topics = get_topics_from_config(configuration)
    mqtt_client = mqtt.Client(userdata={'topic_metadata': {}})
    mqtt_client.on_message = on_message

    broker_url = topics[0]['brokerUrl'].replace("mqtt://", "")
    mqtt_client.connect(broker_url.split(":")[0], int(broker_url.split(":")[1]))
    subscribe_to_topics(mqtt_client, topics, mqtt_client._userdata['topic_metadata'])

    try:
        start_http_server(8000, addr='0.0.0.0')
    except Exception as e:
        print(f"Prometheus server failed to (re-)start: {e}")

    mqtt_client.loop_start()
    print("Prometheus handler started and subscribed to MQTT topics.")

def close_connection():
    global mqtt_client

    if mqtt_client:
        print("Disconnecting MQTT client...")
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
        mqtt_client = None

        print("MQTT client disconnected.")
    else:
        print("MQTT client is not running.")

    print("Clearing Prometheus metrics...")

    for metric in list(gauges.values()):
        try:
            REGISTRY.unregister(metric)
        except KeyError:
            pass
    
    gauges.clear()
    print("All Prometheus metrics cleared.")

if __name__ == "__main__":
    with open("sample_configuration.json", "r") as f:
        config = json.load(f)
    
    setup_instance(config)