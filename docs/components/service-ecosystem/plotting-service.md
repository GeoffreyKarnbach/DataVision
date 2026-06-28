# Plotting Service (`plotting-service`)

The **Plotting Service** is a dedicated backend API that serves as the query engine for the platform's time-series data. Its primary responsibility is to provide the frontend with the specific historical data it needs to generate live plots, acting as a clean interface to the powerful but complex **[Prometheus](components/prometheus.md)** database.

- **Technology:** Python, Flask
- **Port:** `5300`

## Part of an Extensible Service Ecosystem

The Plotting Service, alongside the **[Graph Service](components/service-ecosystem/graph-service.md)**, exemplifies the system's modular and extensible design. They form a "service ecosystem" where small, focused microservices can be easily added to enhance the platform's capabilities. Each service acts as a dedicated backend for a specific data source (`Prometheus` for this service, `Neo4j` for the graph service), providing a clean API that decouples the frontend from the underlying data stores. This pattern makes it simple to introduce new features or data sources in the future by simply adding another specialized service to the ecosystem.

## Key Responsibilities

- **Provides a Filterable API:** Exposes a set of REST endpoints that allow the frontend to request data filtered by `room`, `floor`, `thing`, or `type`.
- **Connects to the Prometheus API:** Acts as the sole client that communicates directly with the Prometheus server on behalf of the frontend.
- **Constructs Targeted PromQL Queries:** Translates simple HTTP requests into precise PromQL (Prometheus Query Language) queries that leverage the rich labels on the stored metrics.
- **Simplifies Prometheus Output:** Receives the detailed JSON response from Prometheus and distills it into a simple key-value dictionary, which is trivial for the frontend to parse and plot.

## The Backend-for-Frontend (BFF) Workflow

This service is crucial for enabling the interactive plotting features in the frontend. It abstracts away the complexity of querying Prometheus.

The typical user workflow it supports is:

1.  A user interacts with the graph visualization in the frontend (powered by the **Graph Service**) and clicks on a "Room" node.
2.  The frontend, knowing the room's name, makes a simple API call to this service, for example: `GET /plotting-service/data/room?room_name=Conference_Room`.
3.  The Plotting Service receives this request and constructs a specific PromQL query, e.g., `'{job="mqtt_exporter", room="conference_room"}'`.
4.  It sends this query to Prometheus, which returns the latest data points for all sensors in that room.
5.  The service simplifies the response into a clean JSON object and returns it to the frontend.

**Example of the Simplified JSON Output:**

```json
{
  "my_smart_office/floor_1/conference_room/humidity": 45.7,
  "my_smart_office/floor_1/conference_room/temperature": 22.5
}
```

---

## System Dependencies

The Plotting Service has one critical dependency to perform its function.

!> **Critical Dependency:** The **[Prometheus](components/prometheus.md)** service **must** be running, accessible, and populated with data. If Prometheus is down or contains no metrics, this service will be unable to return any data for plotting.

It also has an implicit dependency on the **[Virtual Data Fabric](components/virtual-data-fabric.md)**, as the VDF is responsible for generating the metrics with the correct labels that this service relies on for filtering.

---

## For Developers

### Configuration and Environment

The service's connection to the Prometheus server is managed via environment variables that define the `prometheus_url`. The service code selects the correct URL based on the `mode` environment variable (`dev` or `prod`).

### Docker Build and Runtime

The service is containerized using a standard Python `Dockerfile`.

- **Health Check:** The `docker-compose.yml` file includes a health check that periodically tests the `/health` endpoint.
- **Volume Mount:** A volume is mounted to the `/app` directory to allow for live code reloading during development without needing to rebuild the Docker image.

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
