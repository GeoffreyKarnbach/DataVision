# Message Broker (`hivemq`)

The **Message Broker** is the central data bus for the entire system, powered by the reliable and high-performance **HiveMQ** platform. It acts as the "nervous system" for the IoT data pipeline, responsible for decoupling data producers from data consumers.

- **Technology:** HiveMQ (via `hivemq/hivemq4` Docker image)
- **Ports:** `1883` (for MQTT), `8080` (for the HiveMQ Control Center)

### The Role of the Broker

In this project, the message broker's role is a classic publish-subscribe (pub/sub) data pass-through. It does not perform any logic or data transformation itself. Its sole responsibility is to receive messages published on specific topics and instantly deliver them to any and all services that have subscribed to those topics.

- **Producers:** Services like **[Mock Data](components/mock-data.md)** publish raw sensor data to the broker.
- **Consumers:** Services like **Node-RED** and the **[Virtual Data Fabric](components/virtual-data-fabric.md)** subscribe to topics on the broker to receive and process this data.

While HiveMQ is a feature-rich platform, this project uses it for its core, high-performance MQTT brokerage capabilities. A more lightweight broker could serve the same function, but HiveMQ was chosen for its proven stability and ease of deployment.

---

## Data Flow and Topic Structure

The HiveMQ message broker handles two distinct categories of data streams, representing the "before" and "after" states of the data unification pipeline.

### 1. Raw Device Topics (The "Before" State)

These are the initial, device-centric topics published directly by the **[Mock Data](components/mock-data.md)** service. They represent the raw, unprocessed data from the simulated sensors.

- **Structure:** `[Thing Title]/events/[Event Name]`
- **Example:** `HumiditySensorConferenceRoom/events/humidity`
- **Purpose:** To feed the raw sensor readings into the system for processing.
- **Subscribed by:** The **[Node-RED](components/node-red.md)** service, which listens to these topics to begin the transformation process.

### 2. Unified Namespace Topics (The "After" State)

After processing the raw data, the **[Node-RED](components/node-red.md)** service publishes the messages back to the broker on new, semantically structured topics. These topics form the **Unified Namespace**.

- **Structure:** `[Building Name]/[Floor Name]/[Room Name]/[Thing Type]`
- **Example:** `my_smart_office/floor_1/conference_room/humidity`
- **Purpose:** To provide a clean, organized, and location-aware stream of data that is easy for other services to consume.
- **Subscribed by:** The **[Virtual Data Fabric](components/virtual-data-fabric.md)** service, which listens to these unified topics to populate its knowledge graph and metrics endpoints.

---

## Ports and Interfaces

The `hivemq` service exposes two network ports, each with a distinct purpose.

- **Port `1883` (MQTT):** This is the primary and most critical port. All MQTT-based communication between the services in the system occurs through this port. It is the main data channel for the broker.

- **Port `8080` (HiveMQ Control Center):** This port provides access to the HiveMQ Control Center, a web-based administrative interface. While this interface offers powerful tools for monitoring clients and inspecting traffic, **it is not actively used by the project's automated workflow.** It exists purely as a supplementary tool for developers who may wish to manually inspect the broker's status or debug connectivity issues.

---

## System Dependencies

As the central message bus, the `hivemq` service is a foundational component that many other services in the system depend on to function correctly.

!> **System Criticality:** If the HiveMQ broker fails or is unavailable, the real-time data flow of the entire system will cease. Services will be unable to publish or receive data, effectively halting the unification pipeline.

### Key Dependent Services

- **`mock-things` (Producer):** This service's primary function is to publish simulated sensor data _to_ HiveMQ. It has a built-in retry mechanism to wait for the broker to become available on startup.

- **`node-red` (Consumer & Producer):** Node-RED is both a major consumer and producer. As a consumer, it subscribes to the raw device topics; as a producer, it publishes the transformed data back to the broker on the new, unified topics.

- **`virtual-data-fabric` (Consumer):** The VDF's background handlers subscribe to the final unified topics to receive the clean data stream, which it then uses to update its own data stores and endpoints.

---

## Configuration and Management

The HiveMQ service is intentionally kept simple and unconfigured for this project.

### Default Configuration

The service runs using the out-of-the-box default configuration provided by the `hivemq/hivemq4` Docker image. There are no custom configuration files, plugins, or security settings applied. This ensures that the broker is easy to deploy and maintain.

### State Management

This instance of HiveMQ is treated as a stateless pass-through broker. There is no configuration for long-term message or session persistence. If the container is restarted, any in-flight messages that have not been delivered will be lost. This is acceptable for the project's real-time data flow architecture, where the focus is on the live data stream rather than guaranteed delivery of historical data.
