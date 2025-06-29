import bodyParser from "body-parser";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const DATABASE_NAME = "plantsdb";
const PLANTS_COLL   = "plants";

let myApi    = express.Router();
let Plants;

const initApi = async (app) => {
  app.use("/api", myApi);

  let conn = await MongoClient.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1"
  );
  let db = conn.db(DATABASE_NAME);
  Plants = db.collection(PLANTS_COLL);
};

/* Interpret request bodies as JSON and store them in req.body */
myApi.use(bodyParser.json());

myApi.get("/plants", async (req, res) => {
  const all = await Plants.find().toArray();
  res.json(all);
});

myApi.post("/plants", async (req, res) => {
  const result = await Plants.insertOne(req.body);
  res.status(201).json({ id: result.insertedId, ...req.body });
});

myApi.get("/plants/:id", async (req, res) => {
  const { id } = req.params;
  const plant = await Plants.findOne({ _id: new ObjectId(id) });
  if (!plant) {
    return res
      .status(404)
      .json({ error: `No plant found with id ${id}` });
  }
  res.json(plant);
});


myApi.patch("/plants/:id", async (req, res) => {
  const { id } = req.params;
  await Plants.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  const updated = await Plants.findOne({ _id: new ObjectId(id) });
  res.json(updated);
});

myApi.delete("/plants/:id", async (req, res) => {
  const { id } = req.params;
  await Plants.deleteOne({ _id: new ObjectId(id) });
  res.json({ id });
});

myApi.all("/*", (req, res) => {
  res
    .status(404)
    .json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
