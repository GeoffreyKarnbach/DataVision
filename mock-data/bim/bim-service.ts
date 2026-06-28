const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8082;

app.get("/building-bim", (req, res) => {
  const filePath = path.join(__dirname, "building-bim.json");

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        res.status(500).send("Error reading file");
      } else {
        res.setHeader("Content-Type", "application/json");
        res.send(data);
      }
    });
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
