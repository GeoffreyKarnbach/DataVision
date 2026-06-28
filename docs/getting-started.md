# Getting Started

Welcome to the IoT Data Fabric platform! This project is designed to solve a common, complex problem in the IoT world: transforming raw, chaotic, and device-centric data streams into a structured, queryable, and real-time knowledge graph.

This guide will walk you through setting up the entire platform on your local machine and running your first data unification workflow.

## Core Concepts

Before you begin, it helps to understand a few core architectural concepts:

- **Design-Time vs. Run-Time:** The platform is split into two halves. You first use the **Design-Time** environment (the Frontend and the Unified Namespace Service) to model your system. Then, you deploy that model to the **Run-Time** environment, which executes the live data pipeline.
- **The Unified Namespace:** This is the central principle. The system's primary goal is to take messy topics like `HumiditySensorConferenceRoom/events/humidity` and transform them into a clean, contextual topic like `my_smart_office/floor_1/conference_room/humidity`.
- **Extensible Microservices:** The entire platform is a collection of small, focused services that communicate with each other. This makes the system modular, resilient, and easy to understand. For a deeper dive, see the **[Architecture](architecture.md)** page.

## Prerequisites

To run this project, you will need the following software installed on your machine:

- **Git:** To clone the repository.
- **Docker & Docker Compose:** To build and run the containerized services. We recommend installing [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your operating system.

## Installation and Startup

Getting the entire stack running is as simple as cloning the repository and running a single command.

**1. Clone the Repository**

Open your terminal and clone the project to your local machine:

```bash
git clone https://github.com/DataVision-AI/system-design.git
cd system-design
```

**2. Start the System**

Use Docker Compose to build and start all the services in the background:

```bash
docker-compose up -d --build
```

!> **Note:** The very first time you run this command, it will download all the necessary Docker images (Node.js, Python, Neo4j, etc.) and build the custom service images. This process can take several minutes depending on your internet connection. Subsequent startups will be much faster.

The `-d` flag runs the containers in "detached" mode. If you want to see the live logs from all services in your terminal, you can run `docker-compose up` without the `-d`.

## Your First Workflow: A Guided Tour

Once all the services are running, you can interact with the platform. The entire workflow is managed through the main frontend application.

**1. Access the Frontend**

Open your web browser and navigate to: **[http://localhost:4200](http://localhost:4200)**

You will be greeted by the main application dashboard, with a navigation bar at the top.

**2. Register Your Things**

- Navigate to the **`Things List`** tab.
- This is where you register the raw data sources. The system is pre-loaded with sample data from the `mock-things` service. You can add or remove Things here to define the inputs for your pipeline.

**3. Model Your Environment**

- Navigate to the **`Building Structure`** tab.
- Here, you can visually construct a hierarchy of buildings, floors, and rooms.
- Within each room, use the `+ Thing` button to assign the devices you registered in the previous step. This is where you give your raw data its physical context.
- When you are done, save your changes.

**4. Deploy the Pipeline**

This is a two-part step that "compiles" your model into a live pipeline.

- **a) Generate the Flows:** Navigate to the **`Node Red Management`** tab and click **`Generate Node-RED`**. This instructs the UNS to create and deploy the data transformation flows. The page will then update to show a card for each active flow.
- **b) Deploy the Runtime:** On the same tab, click the **`Export to Virtual Data Fabric`** button. Then, navigate to the **`Virtual Data Fabric`** tab and click the final **`Build Virtual Data Fabric`** button. This activates the run-time engine.

**5. Visualize the Result**

- Navigate to the **`Knowledge Graph`** tab.
- You will now see a complete, interactive visualization of your system's structure.
- Click on any node in the graph (e.g., a Room or a Floor) to see live-updating plots of all the sensor data associated with it. Congratulations, you have a fully operational data fabric!

## Stopping the System

When you are finished, you can stop all the running services with a single command from the project's root directory:

```bash
docker-compose down
```

To stop the services AND remove the persistent data volumes (e.g., the Node-RED flows and Grafana configurations), use the `-v` flag. This is useful if you want to ensure a completely clean start the next time.

```bash
docker-compose down -v
```

## What's Next?

You've successfully run the system! To learn more about how it all works, we recommend exploring the rest of the documentation:

- **[Architecture](architecture.md):** For a detailed look at how the services interact.
- **Components:** For deep-dives into the role of each individual service.
