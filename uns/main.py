from flask import Flask, jsonify, request
from flask_cors import CORS
import node_red_generator
import json
import os
import sys
import persister

app = Flask(__name__)
CORS(app)

things = []
building = {"name": "Building","floors": []}
config = {}

############# THING ENDPOINTS ####################

@app.route("/uns/things", methods=["GET"])
def get_all_things():
    return jsonify(things)

@app.route("/uns/things", methods=["POST"])
def add_thing():
    data = request.json
    if not data or "tdLink" not in data or "topicName" not in data:
        return jsonify({"error": "Invalid ThingDto"}), 400

    if any(t["tdLink"] == data["tdLink"] for t in things):
        return jsonify({"error": "Thing already exists"}), 409

    things.append(data)

    # Persist the updated list of things into the JSON file
    persister.persist_thing_list(things)

    return jsonify(data)

@app.route("/uns/things", methods=["DELETE"])
def remove_thing():
    data = request.json
    if not data or "tdLink" not in data:
        return jsonify({"error": "Invalid ThingDto"}), 400

    global things
    things = [t for t in things if t["tdLink"] != data["tdLink"]]

    # Persist the updated list of things into the JSON file
    persister.persist_thing_list(things)

    return jsonify(data)

############# BUILDING ENDPOINTS ####################

@app.route("/uns/building", methods=["GET"])
def get_building():
    return jsonify(building)

@app.route("/uns/building", methods=["POST"])
def save_building():
    global building
    data = request.json
    if not data or "name" not in data or "floors" not in data:
        return jsonify({"error": "Invalid BuildingDto"}), 400

    building = data

    # Persist the building data into the JSON file
    persister.persist_building(building)

    return jsonify(building)

#################### NODE-RED ENDPOINTS ####################

@app.route("/uns/node-red", methods=["POST"])
def generate_node_red_workflow():
    print("Generating Node-RED workflow...")

    node_red_generator.delete_all_current_nodered_flows()

    return jsonify(node_red_generator.generate_workflows_for_building(building))

@app.route("/uns/node-red/running", methods=["GET"])
def node_red_workflow_exists():
    print("Checking if Node-RED workflow exists...")

    return jsonify(node_red_generator.node_red_workflow_exists())


@app.route("/uns/node-red/reset", methods=["POST"])
def reset_node_red():
    print("Resetting Node-RED workflows...")

    node_red_generator.delete_all_current_nodered_flows()
    return jsonify({"status": "Node-RED workflows reset"})

@app.route("/uns/node-red/flows", methods=["GET"])
def get_node_red_flows():
    print("Retrieving Node-RED workflows...")

    return jsonify(node_red_generator.get_node_red_flows())

@app.route("/uns/node-red/node-script", methods=["POST"])
def edit_node_red_flow():
    print("Editing Node-RED flow...")

    data = request.json
    return jsonify(node_red_generator.edit_node_red_node(data))

@app.route("/uns/node-red/node-script", methods=["GET"])
def get_node_red_flow():
    print("Retrieving Node-RED flow...")

    flow_id = request.args.get("flowId")
    if not flow_id:
        return jsonify({"error": "Flow ID is required"}), 400

    return jsonify(node_red_generator.get_node_red_script_details(flow_id))

########### Export Endpoints ############

@app.route("/uns/virtual-data-fabric", methods=["POST"])
def export_data_to_virtual_data_fabric():
    print("Exporting data to Virtual Data Fabric...")

    mode = os.getenv("mode", "dev")
    virtual_data_fabric_url = config.get(mode, {}).get("virtualDataFabricUrl", "http://localhost:5100/")

    return jsonify(node_red_generator.export_data_to_virtual_data_fabric(building, virtual_data_fabric_url))


########## Health Check Endpoint ############
@app.route("/health", methods=["GET"])
def health_check():
    print("Health check endpoint called.")
    return jsonify({"status": "UP"}), 200

if __name__ == "__main__":
    # Check if sys argument --load-sample-data is provided and load sample data if so
    if len(sys.argv) > 1 and sys.argv[1] == "--load-sample-data":
        things, building, config = persister.load_sample_data()
        persister.persist_thing_list(things)
        persister.persist_building(building)
    else:
        # Load existing data from persister
        things = persister.load_thing_list()
        building = persister.load_building()
        config = persister.load_config()

    #node_red_generator.delete_all_current_nodered_flows()
    app.run(host="0.0.0.0", debug=True, port=5001)

