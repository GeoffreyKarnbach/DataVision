from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import requests

app = Flask(__name__)
CORS(app)

@app.route("/plotting-service/data", methods=["GET"])
def get_all_data():
    query = '{job="mqtt_exporter"}'
    try:
        res = requests.get(f"{prometheus_url}/api/v1/query", params={"query": query})
        res.raise_for_status()
        data = res.json()

        result_dict = {}
        for item in data.get("data", {}).get("result", []):
            metric = item.get("metric", {})
            value = item.get("value", [])[1]
            topic = metric.get("topic")
            if topic:
                result_dict[topic] = float(value)

        return jsonify(result_dict), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/plotting-service/data/room", methods=["GET"])
def get_room_data():
    room_name = request.args.get("room_name")
    if not room_name:
        return jsonify({"error": "Missing room_name query parameter"}), 400
    
    room_name = promethify_string(room_name)
    query = f'{{job="mqtt_exporter", room="{room_name}"}}'
    try:
        res = requests.get(f"{prometheus_url}/api/v1/query", params={"query": query})
        res.raise_for_status()
        data = res.json()

        result_dict = {}
        for item in data.get("data", {}).get("result", []):
            metric = item.get("metric", {})
            value = item.get("value", [])[1]
            topic = metric.get("topic")
            if topic:
                result_dict[topic] = float(value)

        return jsonify(result_dict), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/plotting-service/data/floor", methods=["GET"])
def get_floor_data():
    floor_name = request.args.get("floor_name")
    if not floor_name:
        return jsonify({"error": "Missing floor_name query parameter"}), 400
    
    floor_name = promethify_string(floor_name)
    query = f'{{job="mqtt_exporter", floor="{floor_name}"}}'
    try:
        res = requests.get(f"{prometheus_url}/api/v1/query", params={"query": query})
        res.raise_for_status()
        data = res.json()

        result_dict = {}
        for item in data.get("data", {}).get("result", []):
            metric = item.get("metric", {})
            value = item.get("value", [])[1]
            topic = metric.get("topic")
            if topic:
                result_dict[topic] = float(value)

        return jsonify(result_dict), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/plotting-service/data/thing", methods=["GET"])
def get_thing_data():
    topic_name = request.args.get("topic_name")
    if not topic_name:
        return jsonify({"error": "Missing topic_name query parameter"}), 400
    
    query = f'{{job="mqtt_exporter", topic="{topic_name}"}}'
    try:
        res = requests.get(f"{prometheus_url}/api/v1/query", params={"query": query})
        res.raise_for_status()
        data = res.json()

        result_dict = {}
        print(data)
        for item in data.get("data", {}).get("result", []):
            metric = item.get("metric", {})
            value = item.get("value", [])[1]
            topic = metric.get("topic")
            if topic:
                result_dict[topic] = float(value)

        return jsonify(result_dict), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/plotting-service/data/type", methods=["GET"])
def get_type_data():
    type_name = request.args.get("type_name")
    if not type_name:
        return jsonify({"error": "Missing type_name query parameter"}), 400
    
    type_name = promethify_string(type_name)
    query = f'{{job="mqtt_exporter", type="{type_name}"}}'
    try:
        res = requests.get(f"{prometheus_url}/api/v1/query", params={"query": query})
        res.raise_for_status()
        data = res.json()

        result_dict = {}
        for item in data.get("data", {}).get("result", []):
            metric = item.get("metric", {})
            value = item.get("value", [])[1]
            topic = metric.get("topic")
            if topic:
                result_dict[topic] = float(value)

        return jsonify(result_dict), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    print("Health check endpoint called.")
    return jsonify({"status": "UP"}), 200

def promethify_string(s):
    """Convert a string to a Prometheus-compatible label."""
    return s.lower().replace(" ", "_").replace("/", "_").replace("-", "_")

if __name__ == "__main__":
    mode = os.getenv("mode", "dev")
    if mode == "dev":
        prometheus_url = os.getenv("prometheus_dev_uri", "http://localhost:9090")
    else:
        prometheus_url = os.getenv("prometheus_prod_uri", "http://prometheus:9090")


    app.run(host="0.0.0.0", port=5300, debug=True)