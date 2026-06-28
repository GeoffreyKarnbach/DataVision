# Graph Service (`graph-service`)

The **Graph Service** is a dedicated backend API whose sole purpose is to serve the system's structural model from the **[Neo4j](components/neo4j.md)** database in a format that is ready for immediate visualization in the frontend. It acts as a specialized adapter, translating the raw graph data into a clean, frontend-friendly JSON structure.

- **Technology:** Python, Flask
- **Port:** `5200`

## Part of an Extensible Service Ecosystem

The Graph Service and its counterpart, the **[Plotting Service](components/service-ecosystem/plotting-service.md)**, are prime examples of the system's modular and extensible design. They form a "service ecosystem" where small, focused microservices can be easily added to enhance the platform's capabilities. Each service acts as a dedicated backend for a specific data source (`Neo4j` for this service, `Prometheus` for the plotting service), providing a clean API that decouples the frontend from the underlying data stores. This pattern makes it simple to introduce new features or data sources in the future by simply adding another specialized service to the ecosystem.

## Key Responsibilities

- **Provides a Single Endpoint for the Graph:** Exposes one primary endpoint (`GET /graph-service/graph`) to fetch the entire system model.
- **Queries the Neo4j Database:** Connects to the Neo4j instance and executes a Cypher query to retrieve all nodes and relationships.
- **Transforms and Enriches Data:** Processes the raw database results and transforms them into a specific JSON format designed for a graph visualization library. This includes assigning colors to nodes based on their type and creating human-readable labels.
- **Offers a Readiness Check:** Provides a simple endpoint (`GET /graph-service/ready`) that allows the frontend to check if the graph has been populated before attempting to render it.

## The Backend-for-Frontend (BFF) Workflow

This service is a classic example of a Backend-for-Frontend. It decouples the frontend from the complexities of the database by providing a simple, purpose-built API.

The workflow is straightforward:

1.  The frontend sends a simple `GET` request to `/graph-service/graph`.
2.  The Graph Service executes a `MATCH (m)-[r]->(n)` query against Neo4j to fetch all connected nodes and their relationships.
3.  It then meticulously processes this data, enriching it with colors, labels, and frontend-compatible IDs.
4.  Finally, it returns a single JSON object containing a `nodes` array and a `links` array, which can be directly consumed by a frontend graphing library.

**Example of the Transformed JSON Output:**

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "Floor",
      "label": "Floor: Floor 1",
      "attributes": ["name: Floor 1"],
      "color": "#66ff66"
    },
    {
      "id": "node-2",
      "type": "Room",
      "label": "Room: Conference Room",
      "attributes": ["name: Conference Room"],
      "color": "#ffcc00"
    }
  ],
  "links": [
    {
      "id": "link-101",
      "source": "node-1",
      "target": "node-2",
      "label": "HAS_ROOM"
    }
  ]
}
```

---

## System Dependencies

The Graph Service sits between the database and the frontend and has one critical dependency.

!> **Critical Dependency:** The **[Neo4j](components/neo4j.md)** service **must** be running and accessible for the Graph Service to function. If it cannot connect to the database, its API will return errors.

Furthermore, while it only communicates directly with Neo4j, it has an implicit dependency on the **[Virtual Data Fabric](components/virtual-data-fabric.md)**, as the VDF is responsible for populating the graph in the first place. If the VDF has not "built" the system, the Graph Service will have no data to serve.

---

## For Developers

### Configuration and Environment

The service's connection to the Neo4j database is managed via environment variables, with different URIs for `dev` (localhost) and `prod` (Docker network) environments. These variables are defined in the `.env` file and used at runtime.

### Docker Build and Runtime

The service is containerized using a standard Python `Dockerfile`.

- **Health Check:** The `docker-compose.yml` file includes a health check that periodically tests the `/health` endpoint, ensuring the service is running before other services might try to interact with it.
- **Volume Mount:** As with other services, a volume is mounted to the `/app` directory to allow for live code reloading during development without needing to rebuild the Docker image.

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
