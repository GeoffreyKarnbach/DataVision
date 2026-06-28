# Neo4j

The **Neo4j** service is the **graph database** that stores the structural and relational model of the entire system. It acts as the "single source of truth" for the physical layout of the environment, capturing the hierarchy of buildings, floors, rooms, and the things within them.

- **Technology:** Neo4j (via `neo4j:5` Docker image)
- **Ports:** `7474` (HTTP), `7687` (Bolt Protocol)

## The Structural Backbone

While **[Prometheus](components/prometheus.md)** handles the _what_ and _when_ of sensor data (the time-series values), Neo4j is responsible for the _where_ and _how_ (the context and relationships). Its sole purpose is to store the "knowledge graph" of the system, which includes nodes for:

- `Building`
- `Floor`
- `Room`
- `Thing` (a specific sensor/device)
- `ThingType` (e.g., "humidity", "temperature")

And the relationships that connect them, such as `HAS_FLOOR`, `HAS_ROOM`, and `HAS_THING`. This rich, queryable model is what allows the system to understand that a specific temperature reading is coming from "Floor 1, Conference Room."

!> **Data Separation:** The Neo4j database **only stores the structural model**. It does not contain any of the continuous time-series sensor data, as that is the exclusive responsibility of Prometheus. This separation ensures that each database is used for what it does best.

## A Tightly Controlled Data Flow

The Neo4j service is a foundational component with a very clearly defined and limited set of interactions. It does not communicate with most services directly.

**There are only two services that interact with Neo4j:**

1.  **The Writer: `virtual-data-fabric`**
    The **[Virtual Data Fabric](components/virtual-data-fabric.md)** is the only service that writes to the database. When the VDF receives the final building model from the UNS, it connects to Neo4j and populates it with all the necessary nodes and relationships.

2.  **The Reader: `graph-service`**
    The **[Graph Service](components/service-ecosystem/graph-service.md)** is the only service that reads from the database. It acts as a dedicated API layer, providing endpoints that allow the frontend to query and visualize the system's structure.

This clean separation of read/write responsibilities ensures a stable and predictable data management pattern.

## Powering the User Experience

The data stored in Neo4j is fundamental to the user's workflow in the frontend application. It powers the navigational elements, allowing a user to:

1.  See a visual representation of their building and its layout.
2.  Click on a specific node (like a floor or room).
3.  Trigger a request to the **[Plotting Service](components/service-ecosystem/plotting-service.md)** to fetch the corresponding time-series data for that specific location.

In this way, Neo4j provides the essential context that makes the raw sensor data meaningful.

---

## Configuration and Management

The Neo4j service is configured for simplicity and ease of use within the Docker environment.

- **Authentication:** Basic authentication is enabled via environment variables in `docker-compose.yml` (`NEO4J_AUTH=neo4j/password`).
- **Data Persistence:** No volume is mounted for the Neo4j data directory. This means the graph is ephemeral and will be wiped clean if the container is destroyed. It is rebuilt from scratch by the VDF every time the system is deployed, ensuring it is always a perfect reflection of the user's latest configuration.
- **Neo4j Browser:** For debugging or manual inspection, the Neo4j Browser interface is available at `http://localhost:7474`.
