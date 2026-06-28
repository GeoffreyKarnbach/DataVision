import requests
import uuid
import json
import os
import copy

mode = os.getenv("mode", "dev")
with open("config.json", "r") as config_file:
    config = json.load(config_file)

NODE_RED_URL = config.get(mode, {}).get("nodeRedUrl")
print(f"Using Node-RED URL: {NODE_RED_URL}")

'''
Adds a new Node-RED flow that connects an MQTT input node to an MQTT output node for a specific topic.
'''
def add_new_flow(initial_topic, target_topic, broker = "hivemq", port = 1883):
    node1_id = str(uuid.uuid4()).replace("-", "")[:8]
    node2_id = str(uuid.uuid4()).replace("-", "")[:8]
    mqtt_broker_id = str(uuid.uuid4()).replace("-", "")[:8]

    flow = {
        "label": f"Flow for {initial_topic} to {target_topic}",
        "nodes": [
            {
                "id": mqtt_broker_id,
                "type": "mqtt-broker",
                "name": "MQTT Broker",
                "broker": broker,
                "port": port,
            },
            {
                "id": node1_id,
                "type": "mqtt in",
                "name": "",
                "topic": initial_topic,
                "qos": "2",
                "datatype": "auto-detect",
                "broker": mqtt_broker_id,
                "x": 480,
                "y": 400,
                "wires": [[node2_id]]
            },
            {
                "id": node2_id,
                "type": "mqtt out",
                "name": "",
                "topic": target_topic,
                "qos": "2",
                "retain": False,
                "broker": mqtt_broker_id,
                "x": 800,
                "y": 400,
                "wires": []
            }
        ]
    }

    add_flow_response = requests.post(f"{NODE_RED_URL}/flow", json=flow)
    if add_flow_response.status_code == 200:
        print(f"Successfully added flow from {initial_topic} to {target_topic} on broker {broker}:{port}")
        return add_flow_response.json()['id']
    else:
        print(f"Failed to add flow from {initial_topic} to {target_topic}: {add_flow_response.text}")


'''
Generates Node-RED workflows for the given building.
'''
def generate_workflows_for_building(building):
    building_name = building['name'].lower().replace(" ", "_")
    response_map = {}
    for floors in building['floors']:
        for room in floors['rooms']:
            for thing in room['things']:
                thingType = thing["topicName"].split("/")[-1]
                floor_name = floors['name'].lower().replace(" ", "_")
                room_name = room['name'].lower().replace(" ", "_")
                target_topic = f"{building_name}/{floor_name}/{room_name}/{thingType}"
                initial_topic = thing["topicName"]
                hiveMqUrl = thing["hiveMqBrokerUrl"]
                broker = hiveMqUrl.split("://")[1].split(":")[0]
                port = int(hiveMqUrl.split("://")[1].split(":")[1]) if ":" in hiveMqUrl else 1883
                response_map[initial_topic] = "http://localhost:1880/#flow/" + add_new_flow(initial_topic, target_topic, broker, port)

    return response_map

'''
Deletes all current Node-RED flows.
'''
def delete_all_current_nodered_flows():
    print("Deleting all current Node-RED flows...")
    response = requests.get(f"{NODE_RED_URL}/flows")
    if response.status_code == 200:
        flows = response.json()
        for flow in flows:
            flow_id = flow.get("id")
            flow_type = flow.get("type")
            if flow_id and flow_type == "tab":
                delete_response = requests.delete(f"{NODE_RED_URL}/flow/{flow_id}")
                if delete_response.status_code != 204:
                    print(f"Failed to delete flow {flow_id} because: {delete_response.text}")
    else:
        print(f"Failed to retrieve flows: {response.status_code}")

'''
Returns True if there are any Node-RED workflows, False otherwise.
'''
def node_red_workflow_exists():
    try:
        response = requests.get(f"{NODE_RED_URL}/flows")
        if response.status_code == 200:
            flows = response.json()
            return len(flows) > 1
        else:
            print(f"Failed to retrieve flows: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Node-RED: {e}")
        return False

'''
Returns a dictionary mapping MQTT topics to their corresponding Node-RED flow URLs.
'''
def get_node_red_flows():
    response = requests.get(f"{NODE_RED_URL}/flows")
    response.raise_for_status()

    flows = response.json()
    mqtt_to_flow = {}

    for node in flows:
        if node.get("type") == "mqtt in":
            topic = node.get("topic")
            flow_id = node.get("z")
            mqtt_to_flow[topic] = "http://localhost:1880/#flow/" + flow_id

    return mqtt_to_flow


'''
Return all data needed for the Virtual Data Fabric.
'''
def export_data_to_virtual_data_fabric(building, url):
    print("Exporting data for Virtual Data Fabric...")

    building_copy = copy.deepcopy(building)

    export_data = {
        "building": building_copy
    }

    # For each thing in the building, chance the topic to the new topic used in Node - RED
    for floor in building_copy.get("floors", []):
        for room in floor.get("rooms", []):
            for thing in room.get("things", []):
                if "topicName" in thing:
                    original_topic = thing["topicName"]
                    thing_type = original_topic.split("/")[-1]
                    floor_name = floor['name'].lower().replace(" ", "_")
                    room_name = room['name'].lower().replace(" ", "_")
                    new_topic = f"{building_copy['name'].lower().replace(' ', '_')}/{floor_name}/{room_name}/{thing_type}"
                    thing["topicName"] = new_topic

    # Make a POST request to the URL with path "/configuration"
    response = requests.post(f"{url}/virtual-data-fabric/configuration", json=export_data)
    if response.status_code == 200:
        print("Data exported successfully to Virtual Data Fabric.")
        return {"status": "success", "message": "Data exported successfully"}
    else:
        print(f"Failed to export data: {response.text}")
        raise Exception(f"Failed to export data: {response.text}")

def edit_node_red_node(content):
    flow_id = content.get("nodeId")
    is_enabled = content.get("enabled", False)
    script_content = content.get("scriptContent", "")

    if not flow_id:
        return {"status": "error", "message": "Flow ID (nodeId) is required"}

    flow_data = get_node_red_node(flow_id)
    if not flow_data:
        return {"status": "error", "message": f"Could not retrieve flow with ID: {flow_id}"}
    
    if script_content == "":
        script_content = "return msg; // No script content provided, returning message as is"
    
    # Check for the current nodes in NODE_RED flow

    nodes = flow_data.get("nodes", [])
    mqtt_in_node = None
    mqtt_out_node = None
    existing_function_node = None

    for node in nodes:
        if node.get("type") == "mqtt in":
            mqtt_in_node = node
        elif node.get("type") == "mqtt out":
            mqtt_out_node = node
        elif node.get("type") == "function":
            existing_function_node = node

    if is_enabled:
        if existing_function_node:
            existing_function_node["func"] = script_content
            function_node_id = existing_function_node["id"]
        else:
            function_node_id = str(uuid.uuid4()).replace('-', '')[:16]
            new_function_node = {
                "id": function_node_id,
                "type": "function",
                "z": flow_id,
                "name": "Custom Debug/Logic",
                "func": script_content,
                "outputs": 1,
                "x": (mqtt_in_node["x"] + mqtt_out_node["x"]) / 2, # Position it in the middle
                "y": mqtt_in_node["y"],
                "wires": [[]] # Will be wired to the mqtt-out node
            }
            flow_data["nodes"].append(new_function_node)

        mqtt_in_node["wires"] = [[function_node_id]]
        fn_node_to_wire = next(n for n in flow_data["nodes"] if n["id"] == function_node_id)
        fn_node_to_wire["wires"] = [[mqtt_out_node["id"]]]

    else:


        mqtt_in_node["wires"] = [[mqtt_out_node["id"]]]
        if existing_function_node:
            flow_data["nodes"] = [n for n in flow_data["nodes"] if n.get("type") != "function"]

    if update_node_red_flow(flow_id, flow_data):
        return {"status": "success", "message": "Node-RED flow edited successfully"}
    else:
        return {"status": "error", "message": "Failed to update Node-RED flow"}

def get_node_red_node(node_id):
    print(f"Retrieving Node-RED node with ID: {node_id}")
    response = requests.get(f"{NODE_RED_URL}/flow/{node_id}")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to retrieve node {node_id}: {response.text}")
        return None
    
def update_node_red_flow(flow_id, flow_data):
    url = f"{NODE_RED_URL}/flow/{flow_id}"
    headers = {'Content-type': 'application/json'}
    
    print(f"Updating flow {flow_id} with new data...")

    response = requests.put(url, data=json.dumps(flow_data), headers=headers)
    
    if response.status_code == 200 or response.status_code == 204:
        print("Flow updated successfully.")
        return True
    else:
        print(f"Failed to update flow {flow_id}. Status: {response.status_code}, Response: {response.text}")
        return False
    
def get_node_red_script_details(flow_id):
    if not flow_id:
        return {"status": "error", "message": "Flow ID is required"}, 400

    flow_data = get_node_red_node(flow_id)
    if not flow_data:
        return {"status": "error", "message": f"Could not retrieve flow with ID: {flow_id}"}, 404

    script_details = {
        "enabled": False,
        "scriptContent": ""
    }

    nodes = flow_data.get("nodes", [])
    function_node = None
    for node in nodes:
        if node.get("type") == "function":
            function_node = node
            break

    if function_node:
        mqtt_in_node = None
        for node in nodes:
            if node.get("type") == "mqtt in":
                mqtt_in_node = node
                break

        if mqtt_in_node and mqtt_in_node.get("wires") and mqtt_in_node["wires"][0][0] == function_node["id"]:
            script_details["enabled"] = True
            script_details["scriptContent"] = function_node.get("func", "// No script content found.")
        else:
            script_details["scriptContent"] = function_node.get("func", script_details["scriptContent"])
            
    else:
        print(f"Flow {flow_id}: No function node found. Reporting as disabled.")

    return script_details