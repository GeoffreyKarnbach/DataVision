# Unified Namespace Service (UNS)

The **Unified Namespace Service (UNS)** is the central "design-time" engine of the platform. It acts as the primary interface for the user to define their entire data unification strategy, from registering raw data sources to modeling their physical environment. It then "compiles" this user-defined model into executable Node-RED flows and persists the configuration for deployment to the run-time environment.

- **Technology:** Python, Flask
- **Port:** `5001`

## Key Responsibilities

- **Manages Data Sources:** Maintains a persistent inventory of all raw data sources ("Things") that the user has registered.
- **Models the Physical Environment:** Allows users to build a hierarchical "Building" model, placing Things into specific floors and rooms to give them semantic context.
- **Generates Data Flows:** Dynamically creates and deploys Node-RED flows that transform raw, device-centric MQTT topics into a new, structured, and unified namespace.
- **Enables Advanced Customization:** Allows users to inject custom JavaScript code into any data flow for on-the-fly debugging, transformation, or filtering.
- **Orchestrates Deployment:** Exports the final, unified model to the **Virtual Data Fabric** service to build the run-time instance of the system.

---

## The Core Data Models

The service manages two fundamental data structures that drive the entire unification process: the `things` inventory and the `building` model.

### 1. The "Things" Inventory

The first step in any unification process is to register the raw data sources. A "Thing" represents a single data stream that the user wants to incorporate into their structured model.

**Example Thing Object:**

```json
{
  "tdLink": "http://mock-things:8081/humiditysensorconferenceroom",
  "topicName": "HumiditySensorConferenceRoom/events/humidity",
  "hiveMqBrokerUrl": "mqtt://hivemq:1883"
}
```

- **`topicName`**: The full, raw MQTT topic path that the data is currently being published on. This is the "source" address.
- **`hiveMqBrokerUrl`**: The address of the MQTT broker where the `topicName` can be found.
- **`tdLink`**: A URL pointing to the **Thing Description (TD)** document for the device, providing essential metadata about its capabilities.

This list of Things serves as a "palette" of available data streams that the user can then place into their `building` model.

### 2. The "Building" Model

The `building` object is a hierarchical JSON structure that represents the user's desired "unified model." This is the target structure that the raw data streams will be mapped into.

**Hierarchical Structure:** `Building` > `Floors[]` > `Rooms[]` > `Things[]`

**Example `building` Object:**

```json
{
  "name": "My Smart Office",
  "floors": [
    {
      "name": "Floor 1",
      "rooms": [
        {
          "name": "Conference Room",
          "things": [
            {
              "topicName": "HumiditySensorConferenceRoom/events/humidity",
              "tdLink": "http://mock-things:8081/humiditysensorconferenceroom"
            }
          ]
        }
      ]
    }
  ]
}
```

By placing a Thing object inside a room's `things` array, the user defines a semantic mapping: _"The data from this raw MQTT topic originates from a sensor located in this specific room on this specific floor."_

### Automatic Persistence

To provide a smooth and reliable user experience, the UNS automatically saves your work. Both the `things` list and the `building` structure are persisted to local JSON files (`data/things.json` and `data/building.json`). This ensures that your configuration is safe across service restarts, allowing you to pick up exactly where you left off.

---

## The Unification Engine: Node-RED Flow Generation

The primary output of the UNS is a set of dynamically generated **Node-RED flows**. These flows are the executable implementation of the user's unification model.

For **every single Thing** the user has placed within their `building` model, the UNS generates a dedicated Node-RED flow. Each flow subscribes to the raw source topic and republishes the data to a new, semantically structured topic.

#### The New, Unified Topic Structure

The new topic path is programmatically generated based on the Thing's location within the building hierarchy.

**Structure:** `[Building Name]/[Floor Name]/[Room Name]/[Thing Type]`

**Example Transformation:**

- **Original Topic:** `HumiditySensorConferenceRoom/events/humidity`
- **Location:** Building: "My Smart Office", Floor: "Floor 1", Room: "Conference Room"
- **New Unified Topic:** `my_smart_office/floor_1/conference_room/humidity`

!> **System State:** The UNS communicates directly with the Node-RED Admin API. It will first delete all existing flows in the Node-RED instance before generating the new set. This ensures the Node-RED environment is always a perfect reflection of the current `building` configuration.

### Advanced Customization with Scripts

The UNS provides a powerful feature for advanced users: the ability to inject custom JavaScript code into any generated Node-RED flow via the frontend. This inserts a **`function` node** between the `mqtt in` and `mqtt out` nodes, allowing for on-the-fly data processing.

**Example Use Case: Live Debugging**
A user can insert a simple script to log the payload to the console and inspect the data for a specific flow in real-time.

```javascript
// A simple "wiretap" script to see the payload
node.log("Payload for this flow: " + msg.payload);
return msg; // Pass the original message on
```

---

## Exporting the Unified Model

After the model is defined, the final step is to export it to the run-time environment. The `POST /uns/virtual-data-fabric` endpoint handles this handoff.

When triggered, the UNS modifies the `building` object, replacing all raw `topicName` fields with their **new, unified topic names**. This final, processed configuration is then sent to the **Virtual Data Fabric (VDF)** service, which uses it as the definitive blueprint to build the Neo4j graph and set up the Prometheus and WebSocket servers.

This export step marks the official transition from "design-time" (in the UNS) to "run-time" (in the VDF). For more details, see the documentation for the **[Virtual Data Fabric](components/virtual-data-fabric.md)**.

---

## For Developers

### Configuration (`config.json`)

The UNS relies on `config.json` to know the network addresses of other services. The configuration is split into `dev` and `prod` sections.

```json
{
  "dev": { "nodeRedUrl": "http://localhost:1880" /* ... */ },
  "prod": { "nodeRedUrl": "http://node-red:1880" /* ... */ }
}
```

### Environment Variables

- **`mode`**: Selects which configuration block to use (`dev` or `prod`). Set to `prod` in `docker-compose.yml`.

### Startup Command & Sample Data

- `python main.py`: Starts the service normally, loading existing data.
- `python main.py --load-sample-data`: Ignores existing data and loads a predefined sample set of Things and a sample Building. This is used in `docker-compose.yml` for quick demos.

### Docker Build and Runtime

The service is containerized using a standard Python `Dockerfile`.

- **Health Check:** The `docker-compose.yml` file includes a health check that periodically curls the `/health` endpoint. This allows other services to wait until the UNS is fully ready before starting.
- **Volume Mount:** A volume is mounted at `/app`, meaning local code changes are immediately reflected inside the container, speeding up development.

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

CMD ["python", "main.py"]
```

</details>
