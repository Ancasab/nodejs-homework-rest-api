import express from "express";
import connectToDb from "./utils/connectToDb.js";


connectToDb();

const app = express()


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("<html><body><h1>Dockerizing Node Application<h1><p>Rulez din docker</p></body></html>"));

app.listen(3000, () =>
  console.log(`⚡️[bootup]: Server is running at port: 3000`)
);