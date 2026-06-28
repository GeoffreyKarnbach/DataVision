const mqtt = require("mqtt");
const fs = require("fs");

const topicsConfig = JSON.parse(fs.readFileSync("topics-config.json", "utf-8"));
const topics = topicsConfig.topics;

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Subscription failed for topic ${topic}:`, err);
      } else {
        console.log(`Subscribed to ${topic}`);
      }
    });
  });
});

client.on("message", (topic, message) => {
  console.log(`Received message on topic ${topic}:`, message.toString());
});
