import bodyParser from "body-parser";
import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const DATABASE_NAME = "plantsdb";
const PLANTS_COLL   = "plants";
const USERS_COLL   = "users";

const SECRET     = "Z3465pFZGe6kiEW3yTsQ4Hf/ALQDOtlfosgxP77FefE=";
const CLIENT_ID  = "995897016265-jjqb5mjsff0hbqpmgbr4siimo5ces6nh.apps.googleusercontent.com";

let api    = express.Router();
let Plants;
let Users;

const initApi = async (app) => {
  app.use("/api", api);

  let conn = await MongoClient.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1"
  );
  let db = conn.db(DATABASE_NAME);
  Plants = db.collection(PLANTS_COLL);
  Users  = db.collection(USERS_COLL);
};

const checkAuth = (req, res, next) => {
  const header = req.header("Authorization") || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return res.status(403).json({ error: "Access denied" });
  try {
    res.locals.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Access denied" });
  }
};

/* Change limit like in the lecture example*/
api.use(bodyParser.json({ limit: "20mb" }));
api.use(cors());

api.get("/plants", async (req, res) => {
  const all = await Plants.find().toArray();
  res.json(all);
});

api.post("/plants", checkAuth, async (req, res) => {
  const result = await Plants.insertOne(req.body);
  res.status(201).json({ id: result.insertedId, ...req.body });
});

api.get("/plants/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const plant = await Plants.findOne({ _id: new ObjectId(id) });
  if (!plant) {
    return res
      .status(404)
      .json({ error: `No plant found with id ${id}` });
  }
  res.json(plant);
});


api.patch("/plants/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  await Plants.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  const updated = await Plants.findOne({ _id: new ObjectId(id) });
  res.json(updated);
});

api.delete("/plants/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  await Plants.deleteOne({ _id: new ObjectId(id) });
  res.json({ id });
});

api.post("/google", async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  let data;
  try {
    const login = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
    data = login.getPayload();
  } catch (e) {
    console.error(e);
    return res.status(403).json({ error: "Invalid ID token" });
  }

  let user = await Users.findOne({ email: data.email, type: "google" });
  if (!user) {
    await Users.insertOne({ email: data.email, name: data.name, type: "google" });
    user = { email: data.email };
  }

  const apiKey = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1d" });
  res.json({ email: user.email, apiKey });
});

api.get("/protected", checkAuth, (req, res) => {
  res.json({ message: `Logged in as ${res.locals.user.email}` });
});

api.all("/*", (req, res) => {
  res
    .status(404)
    .json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
