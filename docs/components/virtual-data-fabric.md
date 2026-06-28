# Virtual Data Fabric (`virtual-data-fabric`)

The **Virtual Data Fabric (VDF)** is the primary "run-time" engine of the platform. It acts as the central hub that makes the unified data model operational. After the user designs the data pipeline in the **[Unified Namespace Service (UNS)](components/unified-namespace.md)**, the VDF receives the final blueprint and brings it to life by consuming the clean data stream and exposing it to the rest of the system.

- **Technology:** Python, Flask
- **Ports:** `5100` (API), `8000` (Prometheus Metrics), `8001` (WebSocket Server)

## Key Responsibilities

- **Builds the Knowledge Graph:** Receives the final `building` model from the UNS and uses it to construct a detailed **[Neo4j](components/neo4j.md)** graph representing the physical environment and its sensors.
- **Consumes the Unified Data Stream:** Subscribes to all the new, unified MQTT topics that are published by **[Node-RED](components/node-red.md)**.
- **Serves Historical Metrics:** Listens to the live data and exposes it as a time-series metrics endpoint that **[Prometheus](components/prometheus.md)** can scrape for long-term storage and analysis.
- **Provides a Live Data Feed:** Hosts a WebSocket server that pushes real-time sensor data to any authorized external client, offering a mechanism for third-party integrations.
- **Acts as a Pure Writer to Neo4j:** Its sole responsibility regarding the graph database is to populate it. All read operations are handled by the dedicated **[Graph Service](components/service-ecosystem/graph-service.md)**.

---

## From Unconfigured to Operational: A State-Driven Workflow

The VDF is designed as a state machine that transitions from a dormant to a fully operational state based on commands from the UNS. This ensures that the run-time environment is always a perfect reflection of the user's intended design.

**State 1: Dormant (On Initial Startup)**
When the container starts, the VDF is in a "dormant" state. It starts its Flask API server on port `5100` and waits. At this stage, it is not connected to the message broker and is not running its Prometheus or WebSocket servers. It simply waits for its instructions.

**State 2: Configuration Received (`POST /virtual-data-fabric/configuration`)**
The UNS sends the unified building model to this endpoint. The VDF stores this configuration internally but still does not take any action. It now has the blueprint but is waiting for the command to build.

**State 3: Activation (`POST /virtual-data-fabric/build`)**
This is the central activation trigger. When this endpoint is called, the VDF springs to life:

1.  **Builds the Graph:** It connects to the **[Neo4j](components/neo4j.md)** service and uses the stored configuration to build the entire knowledge graph of `Buildings`, `Floors`, `Rooms`, and `Things`.
2.  **Activates Data Listeners:** It starts its background processes, which connect to the **[Message Broker](components/message-broker.md)** and subscribe to all the unified topics defined in the configuration.
3.  **Launches Services:** The Prometheus metrics server (port `8000`) and the WebSocket server (port `8001`) are started and begin serving data as soon as it arrives.

At this point, the VDF is fully operational. The `POST /virtual-data-fabric/reset` endpoint can be used to tear down all connections, wipe the data, and return the service to its initial dormant state.

---

## Outputs and Interfaces

As part of a highly orchestrated system, the VDF is designed to handle a specific, well-defined data format. It expects numeric or boolean (`true`/`false`) payloads on the unified MQTT topics, which it then serves through three distinct interfaces.

### 1. Prometheus Metrics Server (Port `8000`)

This endpoint serves real-time sensor data in a format designed to be scraped by **[Prometheus](components/prometheus.md)**. It converts boolean values to `1.0` or `0.0`. This interface is the foundation for historical data analysis and dashboarding in **[Grafana](components/grafana.md)**.

- **Example Metric:**
  ```
  iot_sensor_value{building="my_smart_office",floor="floor_1",room="conference_room",thing_type="temperature"} 22.5
  ```

### 2. WebSocket Server (Port `8001`)

This server provides a push-based data feed for live updates. As soon as a message arrives from the message broker, it is immediately broadcast to all connected WebSocket clients. This interface is designed for external applications or real-time monitoring tools that may need to subscribe to the live data stream independently of the main application.

- **Example Message:**
  ```json
  {
    "topic": "my_smart_office/floor_1/conference_room/humidity",
    "floor": "floor_1",
    "room": "conference_room",
    "type": "humidity",
    "value": 45.7
  }
  ```

### 3. API Server (Port `5100`)

This Flask API serves as the control plane for the VDF. Its primary role is to receive commands (`/configuration`, `/build`, `/reset`) from the UNS. It does not provide any endpoints for querying data.

---

## System Architecture and Dependencies

The VDF's architecture prioritizes modularity and resilience, ensuring a stable and reliable run-time environment.

!> **Critical Dependency:** The **[Neo4j](components/neo4j.md)** service **must** be running and available before the VDF can be built. The `depends_on` condition in `docker-compose.yml` enforces this. If the VDF cannot connect to the database during the build step, the activation will fail.

### A Modular, Decoupled Design

Each of the VDF's core functions—the Prometheus server and the WebSocket server—operates as an independent component. Each establishes its own connection to the HiveMQ message broker. This decoupling ensures the services are resilient; a potential issue in the WebSocket service, for example, will have no impact on the continuous collection of historical data by the Prometheus service.

### Downstream Dependencies

The VDF is a critical dependency for several other services that consume the data it provides:

- **`prometheus`**: Scrapes the `/metrics` endpoint on port `8000`.
- **`graph-service`**: Relies on the VDF to have successfully populated the Neo4j database.

---

## Configuration and Management

The VDF's configuration is managed externally and dynamically.

- **Runtime Configuration:** The service is configured entirely at runtime by the payload it receives from the UNS. It has no static configuration related to the data model.
- **`config.json`:** A local `config.json` file is used solely to determine the network address of the Neo4j database, with `dev` and `prod` profiles to handle local and containerized environments.
- **Environment Variables:** The `mode` environment variable is used to select the appropriate profile from `config.json`.

---

## For Developers

### Docker Build and Runtime

The service is containerized using a standard Python `Dockerfile` that sets up the environment and installs dependencies from `requirements.txt`.

- **Health Check:** The `docker-compose.yml` file includes a health check that periodically tests the API server on port `5100`. This allows other services (like the `frontend`) to wait until the VDF is responsive before they start, ensuring a stable startup order.
- **Volume Mount:** The local `./virtual-data-fabric` directory is mounted to `/app` inside the container. This is a key feature for development, as any changes made to the local Python code are immediately reflected in the running container, eliminating the need to rebuild the image for every change.

<details>
<summary><b>Click to see the full Dockerfile</b></summary>

```dockerfile
FROM python:3.11-slim

# Ensures print statements appear in logs without delay
ENV PYTHONUNBUFFERED=1

# Install curl for the health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# Expose all three ports
EXPOSE 5100 8000 8001

CMD ["python", "main.py"]
```

</details>
