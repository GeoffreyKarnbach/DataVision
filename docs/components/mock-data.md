# Mock Data Service (`mock-things`)

The **Mock Data Service** acts as a stand-in for real-world IoT sensors and devices. It is an essential component for development, testing, and system demonstrations, providing a continuous and realistic stream of data when physical hardware is unavailable.

This service is a full **Web of Things (WoT) device simulator**, meaning it not only publishes data but also makes each simulated device discoverable and self-describing through a standardized HTTP interface.

- **Technology:** Node.js, `@node-wot/core`, `@node-wot/binding-mqtt`
- **Port:** `8081` (for the Web of Things HTTP Server)

## Key Responsibilities

- **Simulate IoT Devices:** Creates virtual "Things" based on local configuration files.
- **Generate Realistic Data:** Produces randomized data for different sensor types, including continuous numeric values (like temperature) and binary boolean states (like a door sensor).
- **Publish Data to MQTT:** Publishes the simulated data to the `hivemq` message broker on dynamically generated topic paths.
- **Serve W3C Thing Descriptions:** Runs an HTTP server to provide standardized "Thing Description" (TD) documents for each device, allowing for automated discovery and interaction.
- **Ensure Startup Resilience:** Includes a retry mechanism to patiently wait for the `hivemq` broker to become available before starting its main logic.

---

## Device Configuration

The behavior of each simulated device is controlled by a single JSON file located in the `mock-objects` directory. The service reads all files in this directory on startup.

### Configuration for Numeric Sensors

This configuration is used for devices that report a continuous value, like temperature or humidity.

**Example: `humidity.json`**

```json
{
  "title": "HumiditySensorConferenceRoom",
  "description": "Conference Room humidity sensor",
  "eventTopic": "humidity",
  "data": {
    "type": "number",
    "title": "Humidity",
    "minimum": 30,
    "maximum": 70
  }
}
```

- **`title`**: A unique name for the simulated Web of Things (WoT) device. It is used for logging and for identifying the device in its Thing Description.
- **`description`**: A human-readable description of the device's purpose.
- **`eventTopic`**: Defines the name of the "event" that the WoT device will emit. This is used to construct the final MQTT topic path.
- **`data`**: This object describes the data payload that will be generated.
  - **`type`**: Must be set to `"number"`. This tells the service to generate a random floating-point number.
  - **`minimum` & `maximum`**: These define the range for the random number generation. The service will produce a value between these two numbers (e.g., `55.34`).

### Configuration for Boolean Sensors

This configuration is used for devices with two states, such as a door sensor (open/closed) or a motion detector (detected/clear).

**Example: `door-sensor.json`**

```json
{
  "title": "ElevatorDoorSensor",
  "description": "Elevator door sensor (open/closed)",
  "eventTopic": "door",
  "data": {
    "type": "boolean",
    "title": "Door Open"
  }
}
```

- **`type`**: Must be set to `"boolean"`. This tells the service to randomly generate either `true` or `false` as the payload. The `minimum` and `maximum` keys are ignored for this type.

---

## Service Outputs

The service produces data on two distinct protocols: MQTT for real-time data streaming and HTTP for device discovery.

### MQTT Output

The `@node-wot/binding-mqtt` library automatically generates the full MQTT topic path for each simulated device. The structure follows a consistent and predictable pattern:

**Topic Structure:** `[Thing Title]/events/[Event Topic]`

- **`[Thing Title]`**: Taken directly from the `title` field in the device's JSON configuration.
- **`/events/`**: A static segment inserted by the WoT MQTT binding.
- **`[Event Topic]`**: Taken directly from the `eventTopic` field in the JSON configuration.

#### Examples:

1.  **Humidity Sensor:** `HumiditySensorConferenceRoom/events/humidity`
2.  **Door Sensor:** `ElevatorDoorSensor/events/door`

### HTTP / Web of Things Interface

The service runs an HTTP server on port `8081` to make each simulated device discoverable and self-describing via a **W3C Thing Description (TD)**. This TD acts as a "user manual" for the device, providing all the information needed to interact with it.

A consumer can find out exactly how to subscribe to a device's data by fetching its TD. The `forms` array within the TD advertises all available communication bindings.

**Excerpt from a Thing Description:**

```json
{
  "events": {
    "humidity": {
      "forms": [
        {
          "href": "mqtt://hivemq:1883/HumiditySensorConferenceRoom/events/humidity",
          "op": ["subscribeevent"]
        },
        {
          "href": "http://<container_ip>:8081/humiditysensorconferenceroom/events/humidity",
          "op": ["subscribeevent"]
        }
      ]
    }
  }
}
```

---

## Dependencies and Startup Behavior

The `mock-things` service is fundamentally a data publisher and has a single, critical dependency.

### The HiveMQ Message Broker

The service is explicitly designed to connect to the `hivemq` service. This dependency is declared in `docker-compose.yml` to ensure a proper startup order.

!> **Critical Dependency:** The HiveMQ message broker **must** be running and accessible _before_ the `mock-things` service can fully initialize. If the broker is unavailable, the service will be unable to publish any data.

### Built-in Resilience: The Retry Mechanism

The service's startup script contains a resilience mechanism to handle scenarios where `hivemq` might be slow to start.

1.  **Initial Connection Attempt:** Upon starting, the script immediately tries to connect to the HiveMQ broker.
2.  **Retry Loop:** If the connection fails, it will attempt to connect up to **10 times**, waiting **10 seconds** between each attempt.
3.  **Graceful Failure:** If all 10 retries fail, the script will print a detailed error message and exit, preventing the container from running in a non-functional state.

---

## For Developers

### Environment Variables

The service's behavior can be controlled by the `mode` environment variable, which is useful for switching between local development and containerized deployment.

- **`mode`**: Determines the URL of the HiveMQ broker.
  - If `mode=dev` (or if not set), it connects to `mqtt://localhost:1883`.
  - If `mode=prod` (as set in `docker-compose.yml`), it connects to `mqtt://hivemq:1883`, using Docker's internal DNS.

### Development & Build Process

The service is containerized using a standard `Dockerfile` for a Node.js application.

<details>
<summary><b>Click to see the full Dockerfile</b></summary>

```dockerfile
# Use official Node.js image as the base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app will run on
EXPOSE 8081

# Run the application
CMD ["node", "mock-wot-emitter.ts"]
```

</details>
