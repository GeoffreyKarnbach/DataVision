# Grafana

The **Grafana** service provides a powerful, industry-standard platform for data visualization. Within this project, it serves as a supplementary tool for users who wish to perform in-depth analysis or create custom monitoring dashboards using the historical data stored in **[Prometheus](components/prometheus.md)**.

- **Technology:** Grafana (via `grafana/grafana` Docker image)
- **Port:** `3000`

## An Alternative for Custom Visualization

While the primary, integrated plotting experience is provided by the main **[Frontend](components/frontend.md)** service, Grafana is included as a powerful alternative for advanced data exploration. It is the ideal tool for:

- Creating custom, persistent dashboards with multiple panels.
- Performing complex queries against the historical Prometheus data.
- Analyzing long-term trends across different sensors.

### Pre-configured for Immediate Use

To ensure a seamless and rapid start, the Grafana instance is automatically provisioned when the system starts up.

1.  **Automatic Datasource Configuration:** The **[Prometheus](components/prometheus.md)** service is pre-configured as the default data source. This means users can immediately start building panels and exploring data without any manual setup.
2.  **Example Dashboard:** A basic dashboard is included to demonstrate the connection and provide a starting point for users to build their own visualizations.

---

## Access and Management

The Grafana service runs independently and is accessed directly through its web interface.

- **URL:** `http://localhost:3000`
- **Default Username:** `admin`
- **Default Password:** `admin` (as set in `docker-compose.yml`)

The pre-configuration is managed via volume mounts in the `docker-compose.yml` file, which point to local configuration files for datasources and dashboards. This ensures a consistent and ready-to-use environment every time the service starts.
