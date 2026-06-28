const core_1 = require("@node-wot/core");
const binding_mqtt_1 = require("@node-wot/binding-mqtt");
const HttpServer = require("@node-wot/binding-http").HttpServer;
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mqtt = require("mqtt");

dotenv.config();
const mode = process.env.mode || "dev";

var hiveMQUrl = "mqtt://hivemq:1883";
if (mode === "dev") {
  hiveMQUrl = "mqtt://localhost:1883";
}

console.log("Using HiveMQ URL: ", hiveMQUrl);

// Wait until the HiveMQ broker is ready

function waitForHiveMQ(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(url);
    let settled = false;

    client.on("connect", () => {
      if (!settled) {
        settled = true;
        client.end();
        resolve();
      }
    });

    client.on("error", (err) => {
      if (!settled) {
        settled = true;
        client.end();
        reject(err);
      }
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        client.end();
        reject(new Error("Timeout waiting for HiveMQ"));
      }
    }, timeout);
  });
}

async function retryHiveMQ(url, retries = 10, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      await waitForHiveMQ(url, delay);
      return;
    } catch (err) {
      console.warn(`Retrying HiveMQ connection (${i + 1}/${retries})...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Failed to connect to HiveMQ after multiple attempts");
}

retryHiveMQ(hiveMQUrl)
  .then(() => {
    const servient = new core_1.Servient();
    servient.addServer(new binding_mqtt_1.MqttBrokerServer({ uri: hiveMQUrl }));
    const httpServer = new HttpServer({ port: 8081 });
    servient.addServer(httpServer);

    servient.start().then((WoT) => {
      const devicesDir = path.join(__dirname, "mock-objects");
      const deviceFiles = fs.readdirSync(devicesDir);

      deviceFiles.forEach((file) => {
        const filePath = path.join(devicesDir, file);
        const deviceData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        WoT.produce({
          title: deviceData.title,
          description: deviceData.description,
          events: {
            [deviceData.eventTopic]: {
              title: deviceData.title,
              description: deviceData.description,
              data: deviceData.data,
            },
          },
        })
          .then((thing) => {
            console.log(
              `Produced and exposing ${thing.getThingDescription().title}`
            );

            thing.expose().then(() => {
              console.info(
                `${thing.getThingDescription().title} ready on topic: ${
                  deviceData.eventTopic
                }`
              );
              setInterval(() => {
                if (deviceData.data.type === "boolean") {
                  const status = Math.random() < 0.5;
                  thing.emitEvent(deviceData.eventTopic, status);
                  console.info(`${deviceData.title} status: `, status);
                } else {
                  if (
                    deviceData.data.maximum !== undefined &&
                    deviceData.data.minimum !== undefined
                  ) {
                    const value =
                      Math.random() *
                        (deviceData.data.maximum - deviceData.data.minimum) +
                      deviceData.data.minimum;
                    thing.emitEvent(deviceData.eventTopic, value);
                    console.info(`${deviceData.title} value: `, value);
                  }
                }
              }, Math.random() * 5000 + 3000);
            });
          })
          .catch((e) => {
            console.log(e);
          });
      });
    });
  })
  .catch((err) => {
    console.error("Error waiting for HiveMQ:", err);
    process.exit(1);
  });
