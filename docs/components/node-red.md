# Node-RED

The **Node-RED** service is the primary **data transformation engine** of the entire platform. It acts as the dedicated runtime environment for the data unification flows that are dynamically generated and deployed by the **[Unified Namespace Service (UNS)](components/unified-namespace.md)**.

- **Technology:** Node-RED (via `nodered/node-red` Docker image)
- **Port:** `1880` (for the editor and Admin API)

### The Role of the Execution Engine

Node-RED's fundamental responsibility is to execute the logic defined by the user. This involves three key steps for each data stream:

1.  **Subscribing** to the raw, device-centric MQTT topics.
2.  **Executing** any user-defined custom scripts for data processing, transformation, or filtering.
3.  **Republishing** the final message onto the new, structured topics of the Unified Namespace.

In essence, Node-RED is the "hands-on worker" that carries out the specific, step-by-step instructions designed by the user in the UNS.

---

## The Role of the Node-RED Editor

The Node-RED instance comes with its powerful, web-based visual flow editor, accessible on port `1880`. While this editor provides a complete view of the data transformation logic, its intended role in this project is for **monitoring and debugging**, not for direct modification of the core unification flows.

### A Read-Only View of the System

The **[Unified Namespace Service (UNS)](components/unified-namespace.md)** is the single source of truth for the entire data pipeline. It programmatically creates, manages, and deletes the flows running in Node-RED.

!> **Warning: Manual Changes Will Be Overwritten**

> Any manual modifications made directly in the Node-RED editor (such as adding nodes, changing wires, or editing properties) are temporary and **will be permanently lost** the next time the UNS generates the workflows. Furthermore, altering the structure of a flow may prevent the UNS from correctly applying or removing custom scripts, leading to unexpected behavior.

### Recommended Uses for the Editor

The editor is an invaluable tool for observing the system in real-time. Developers are encouraged to use it for:

- **Visualizing the Data Path:** Seeing the clear, one-to-one mapping from a raw topic to its new, unified topic.
- **Observing Node Status:** Watching the status indicators below the MQTT nodes to confirm they are connected to the broker.
- **Debugging Live Flow:** Using the built-in message counters on nodes to see if data is actively passing through a specific flow.

For any changes to be permanent, they must be configured through the main application's frontend, which then instructs the UNS to deploy them correctly.

---

## Configuration and Persistence

To ensure the operational stability and resilience of the data transformation engine, the Node-RED service is configured with a persistent volume. This is a crucial aspect of its design, safeguarding the deployed flows against service interruptions.

### The `/data` Volume Mount

In the `docker-compose.yml` file, a local directory `./node-red-data` is mounted to the container's `/data` directory:

```yaml
volumes:
  - ./node-red-data:/data
```

This `/data` directory is the core workspace for Node-RED, storing all critical runtime information, including the `flows.json` file which contains the complete definition of all deployed flows.

### The Benefits of Persistence

Persisting this directory provides two major benefits:

1.  **Resilience and Automatic Recovery:** If the Node-RED container were to crash or be restarted, this volume ensures that it will immediately reload the last set of flows deployed by the UNS. This provides seamless, automatic recovery from temporary failures.
2.  **Improved Development Workflow:** When running `docker-compose down` and `docker-compose up`, the state of the Node-RED instance is preserved, so developers do not have to re-deploy all the flows from scratch every time.

This approach treats the deployed flows as critical runtime configuration that should survive service restarts, making the entire system more robust.

---

## System Dependencies and Runtime

### Operational Dependency on HiveMQ

The Node-RED service itself starts up independently. However, for the **flows running inside Node-RED** to function, they have an implicit operational dependency on the **[Message Broker](components/message-broker.md)**. The MQTT nodes within each flow will continuously attempt to connect to the `hivemq` service, and the data pipeline will only become operational once this connection is successful.

### Timezone and Health Check

The service is configured with two key settings in `docker-compose.yml`:

- **Timezone (`TZ=Europe/Vienna`):** This ensures that any timestamps generated within Node-RED (e.g., in logs) are consistent and reflect the intended local time, making debugging easier.
- **Health Check:** A `healthcheck` instruction periodically tests if the Node-RED editor is accessible. This is crucial for the system's startup order, as it allows services like the UNS to wait until Node-RED is fully initialized and ready to accept API requests before they try to deploy flows.
