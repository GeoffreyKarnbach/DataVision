
import json
import os

def persist_building(building):
    os.makedirs("data", exist_ok=True)

    with open("data/building.json", "w") as f:
        json.dump(building, f, indent=4)

def load_building():
    if not os.path.exists("data/building.json"):
        return None

    with open("data/building.json", "r") as f:
        building = json.load(f)

    return building

def persist_thing_list(things):
    os.makedirs("data", exist_ok=True)

    with open("data/things.json", "w") as f:
        json.dump(things, f, indent=4)

def load_thing_list():

    if not os.path.exists("data/things.json"):
        return []

    with open("data/things.json", "r") as f:
        things = json.load(f)

    return things

def load_sample_data():

    things = []

    mode = os.getenv("mode", "dev")
    config = load_config()

    hive_mq_url = config.get(mode, {}).get("hiveMqUrl")
    
    with open("sample_topics.json", "r") as f:
        temp = json.load(f)

    # TODO: For actual deployment use "mode" instead of ""dev""
    tdBaseUrl = config.get("dev", {}).get("tdLink", "http://localhost:8081/")
    print(f"Using TD Base URL: {tdBaseUrl}")
    
    for i in temp:
        things.append({
            "tdLink": tdBaseUrl + i.split("/")[0].lower(),
            "topicName": i,
            "hiveMqBrokerUrl": hive_mq_url,
        })
    
    try:
        with open("sample_building.json", "r") as f:
            building = json.load(f)
            for floor in building.get("floors", []):
                for room in floor.get("rooms", []):
                    for thing in room.get("things", []):
                        if "hiveMqBrokerUrl" not in thing:
                            thing["hiveMqBrokerUrl"] = hive_mq_url
                            if "tdLink" in thing:
                                thing["tdLink"] = tdBaseUrl + thing["tdLink"].split("/")[-1].lower()
                                
    except FileNotFoundError:
        print("No sample building data found, using default.")

    return things, building, config

def load_config():
    with open("config.json", "r") as config_file:
        config = json.load(config_file)
    
    return config