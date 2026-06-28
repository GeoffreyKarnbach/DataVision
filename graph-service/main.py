from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from neo4j_handler import GraphService
import os

app = Flask(__name__)
CORS(app)

@app.route("/graph-service/graph", methods=["GET"])
def get_graph():
    data = neo4j_handler.get_full_graph()
    return jsonify(data)

@app.route("/graph-service/ready", methods=["GET"])
def readiness_check():
    exist_any_node = neo4j_handler.exist_any_node()
    return jsonify(exist_any_node), 200

@app.route("/health", methods=["GET"])
def health_check():
    print("Health check endpoint called.")
    return jsonify({"status": "UP"}), 200

@app.teardown_appcontext
def shutdown_session(exception=None):
    neo4j_handler.close()

if __name__ == "__main__":
    mode = os.getenv("mode", "dev")
    if mode == "dev":
        neo4j_user = os.getenv("neo4j_user", "neo4j")
        neo4j_password = os.getenv("neo4j_password", "password")
        neo4j_uri = os.getenv("neo4j_dev_uri", "bolt://localhost:7687")
    else:
        neo4j_user = os.getenv("neo4j_user", "neo4j")
        neo4j_password = os.getenv("neo4j_password", "password")
        neo4j_uri = os.getenv("neo4j_prod_uri", "bolt://neo4j_:7687")

    neo4j_handler = GraphService(neo4j_uri, neo4j_user, neo4j_password)

    app.run(host="0.0.0.0", port=5200, debug=True)