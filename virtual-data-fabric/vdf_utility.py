import json

gauges = {}

def get_topics_from_config(configuration):
    topics = []
    for floor in configuration["building"]["floors"]:
        floor_name = sanitize_label(floor["name"])
        for room in floor["rooms"]:
            room_name = sanitize_label(room["name"])
            for thing in room["things"]:
                topic = thing["topicName"]
                td_link = thing["tdLink"]
                broker_url = thing["hiveMqBrokerUrl"]
                topics.append({
                    "topic": topic,
                    "floor": floor_name,
                    "room": room_name,
                    "td": td_link,
                    "brokerUrl": broker_url
                })

    return topics

def sanitize_label(value):
    return value.lower().replace(" ", "_")

if __name__ == "__main__":

    with open("sample_configuration.json", "r") as file:
        sample_configuration = json.load(file)

    print(get_topics_from_config(sample_configuration))