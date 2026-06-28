from neo4j import GraphDatabase

class GraphService:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_full_graph(self):
        query = "MATCH (m)-[r]->(n) RETURN m, r, n"
        with self.driver.session() as session:
            result = session.run(query)
            nodes_map = {}
            links = []

            for record in result:
                for node in [record["m"], record["n"]]:
                    node_id = node.id
                    if node_id not in nodes_map:
                        label = next(iter(node.labels), "Node")
                        props = dict(node)
                        attributes = [f"{k}: {v}" for k, v in props.items()]
                        nodes_map[node_id] = {
                            "id": f"node-{node_id}",
                            "type": label,
                            "label": f"{label}: {props.get('name', props.get('tdLink', '/no_name').split('/')[-1])}",
                            "attributes": attributes,
                            "color": assign_color(label)
                        }

                rel = record["r"]
                links.append({
                    "id": f"link-{rel.id}",
                    "source": f"node-{record['m'].id}",
                    "target": f"node-{record['n'].id}",
                    "label": rel.type
                })

            return {
                "nodes": list(nodes_map.values()),
                "links": links
            }
    
    def exist_any_node(self):
        query = "MATCH (n) RETURN COUNT(n) > 0 AS exists"
        with self.driver.session() as session:
            result = session.run(query)
            return result.single()[0]

def assign_color(label):
    mapping = {
        "Room": "#ffcc00",
        "Thing": "#66ccff",
        "ThingType": "#ff6666",
        "Building": "#9999ff",
        "Floor": "#66ff66",
    }
    return mapping.get(label, "#cccccc")
