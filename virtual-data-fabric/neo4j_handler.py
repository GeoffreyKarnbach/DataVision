import os
import json
from neo4j import GraphDatabase

mode = os.getenv('mode', 'dev')
with open("config.json", "r") as file:
    config = json.load(file)

neo4jUrl = config.get(mode, {}).get("neo4jUrl", "bolt://localhost:7687")
neo4jUser = config.get(mode, {}).get("neo4jUser", "neo4j")
neo4jPassword = config.get(mode, {}).get("neo4jPassword", "password")


def get_all_thing_types(building):
    thing_types = set()
    for floor in building.get("floors", []):
        for room in floor.get("rooms", []):
            for thing in room.get("things", []):
                thing_type = thing.get("topicName", "").split("/")[-1]
                if thing_type:
                    thing_types.add(thing_type)
    return list(thing_types)

def setup_instance(configuration):
    
    driver = GraphDatabase.driver(neo4jUrl, auth=(neo4jUser, neo4jPassword))

    with driver.session() as session:
        building = configuration["building"]
        building_name = building["name"]
        session.execute_write(create_node, "Building", "name", {"name": building_name})

        thing_types = get_all_thing_types(building)
        for thing_type in thing_types:
            session.execute_write(create_node, "ThingType", "name", {"name": thing_type})

        
        for floor in building["floors"]:
            floor_name = floor["name"]
            session.execute_write(create_node, "Floor", "name", {"name": floor_name})
            session.execute_write(create_relationship, "Building", building_name, "Floor", floor_name, "HAS_FLOOR")

            for room in floor["rooms"]:
                room_name = room["name"]
                session.execute_write(create_node, "Room", "name", {"name": room_name})
                session.execute_write(create_relationship, "Floor", floor_name, "Room", room_name, "HAS_ROOM")

                for thing in room["things"]:
                    td = thing["tdLink"]
                    topic = thing["topicName"]
                    broker = thing["hiveMqBrokerUrl"]
                    thingType = thing["topicName"].split("/")[-1]

                    session.execute_write(create_node, "Thing", "tdLink", {
                        "tdLink": td,
                        "topicName": topic,
                        "hiveMqBrokerUrl": broker
                    })
                    session.execute_write(create_relationship, "Room", room_name, "Thing", td, "HAS_THING", from_key_name="name", to_key_name="tdLink")
                    session.execute_write(create_relationship, "ThingType", thingType, "Thing", td, "IS_TYPE_OF", from_key_name="name", to_key_name="tdLink")
    
    print("Neo4j instance setup completed successfully.")


def create_node(tx, label, match_key, properties):
    props_str = ", ".join(f"{k}: ${k}" for k in properties)
    tx.run(
        f"""
        MERGE (n:{label} {{ {match_key}: ${match_key} }})
        SET n += {{ {props_str} }}
        """,
        **properties,
    )

def create_relationship(tx, from_label, from_key, to_label, to_key, rel_type, from_key_name="name", to_key_name="name"):
    tx.run(
        f"""
        MATCH (a:{from_label} {{{from_key_name}: $from_value}})
        MATCH (b:{to_label} {{{to_key_name}: $to_value}})
        MERGE (a)-[r:{rel_type}]->(b)
        """,
        from_value=from_key,
        to_value=to_key,
    )

def delete_all_content():
    driver = GraphDatabase.driver(neo4jUrl, auth=(neo4jUser, neo4jPassword))
    with driver.session() as session:
        session.execute_write(lambda tx: tx.run("MATCH (n) DETACH DELETE n"))
    driver.close()

def any_node_exists():
    driver = GraphDatabase.driver(neo4jUrl, auth=(neo4jUser, neo4jPassword))
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN count(n) AS count")
        count = result.single()["count"]
    driver.close()
    return count > 0

if __name__ == "__main__":

    with open("sample_configuration.json", "r") as file:
        sample_configuration = json.load(file)

    delete_all_content()
    
    setup_instance(sample_configuration)