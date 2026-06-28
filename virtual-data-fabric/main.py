from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import neo4j_handler
import prometheus_handler
import websocket_handler
import asyncio
import threading

app = Flask(__name__)
CORS(app)

configuration = {}
built = False
server_thread = None

@app.route("/virtual-data-fabric/configuration", methods=["POST"])
def receive_configuration():
    global configuration

    data = request.json
    configuration = data
    
    return jsonify({"message": "Configuration received successfully"}), 200

@app.route("/virtual-data-fabric/reset", methods=["POST"])
def reset_all():
    global configuration, built

    configuration = {}
    built = False

    neo4j_handler.delete_all_content()
    prometheus_handler.close_connection()

    return jsonify({"message": "All configurations have been reset"}), 200

@app.route("/virtual-data-fabric/build", methods=["POST"])
def build_virtual_data_fabric():
    global configuration, built, server_thread

    if not configuration:
        print("No configuration provided")
        return jsonify({"error": "No configuration provided"}), 400
    
    neo4j_handler.setup_instance(configuration)
    prometheus_handler.setup_instance(configuration)

    if not server_thread:
        server_thread = threading.Thread(target=start_websocket_server, args=(configuration,), daemon=True)
        server_thread.start()

    built = True
    
    return jsonify({"message": "Virtual Data Fabric built successfully", "configuration": configuration}), 200

@app.route("/virtual-data-fabric/status", methods=["GET"])
def get_status():
    global built

    status = neo4j_handler.any_node_exists() and True

    return jsonify(status)

@app.route("/virtual-data-fabric/ready-to-build", methods=["GET"])
def get_ready_to_build():
    global configuration

    if not configuration:
        return jsonify(False)

    return jsonify(True)

@app.route("/health", methods=["GET"])
def health_check():
    print("Health check endpoint called.")
    return jsonify({"status": "UP"}), 200

def load_sample_data():
    global configuration

    with open("sample_configuration.json", "r") as file:
        configuration = json.load(file)

def start_websocket_server(config):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websocket_handler.main(config))

if __name__ == "__main__":
    #load_sample_data()
    #print("Sample configuration loaded")
    neo4j_handler.delete_all_content()
    app.run(host="0.0.0.0", port=5100, debug=True)