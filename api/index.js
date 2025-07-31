import bodyParser from "body-parser";
import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const DATABASE_NAME = "plantsdb";
const PLANTS_COLL = "plants";
const USERS_COLL = "users";

const SECRET = "Z3465pFZGe6kiEW3yTsQ4Hf/ALQDOtlfosgxP77FefE=";
const CLIENT_ID = "995897016265-jjqb5mjsff0hbqpmgbr4siimo5ces6nh.apps.googleusercontent.com";

let api = express.Router();
let Plants;
let Users;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  let conn = await MongoClient.connect("mongodb://127.0.0.1");
  let db = conn.db(DATABASE_NAME);
  Plants = db.collection(PLANTS_COLL);
  Users = db.collection(USERS_COLL);
};

const checkAuth = async (req, res, next) => {
  let [type, key] = req.header("Authorization").split(" ");
  if (type !== "Bearer") {
    /* Not a recognized type. */
    res.status(401).json({ error: "Unrecognized Authorization header" });
    return;
  }

  try {
    let verified = jwt.verify(key, SECRET);
    res.locals.user = await Users.findOne({ email: verified.email });
    if (!res.locals.user) {
      res.status(403).json({ error: "User doesn't exist" });
      return;
    }
    next();
  } catch (e) {
    console.warn(e);
    res.status(403).json({ error: "Access denied" });
  }
}

/* Change limit like in the lecture example*/
api.use(bodyParser.json({ limit: "20mb" }));
api.use(cors());

api.get("/plants", checkAuth, async (req, res) => {
  let email = res.locals.user.email;
  let plants = await Plants.find({ owner: email }).toArray();
  res.json(plants);
});

api.post("/plants", checkAuth, async (req, res) => {
  let email = res.locals.user.email;
  let doc = { ...req.body, owner: email, lastWatered: new Date() };
  let { insertedId } = await Plants.insertOne(doc);
  res.status(201).json({ ...doc, _id: insertedId });
});

api.get("/plants/:id", checkAuth, async (req, res) => {
  let email = res.locals.user.email;
  let _id = new ObjectId(req.params.id);
  let plant = await Plants.findOne({ _id, owner: email });
  if (!plant) return res.status(404).json({ error: "Not found" });
  res.json(plant);
});

api.patch("/plants/:id", checkAuth, async (req, res) => {
  let email = res.locals.user.email;
  let _id = new ObjectId(req.params.id);
  let { nickname, species, frequencyDays, lastWatered } = req.body;
  let updates = { nickname, species, frequencyDays, lastWatered };
  let keys = Object.keys(updates);
  for (let key of keys) {
    if (updates[key] === undefined) {
      delete updates[key];
    }
  }
  let r = await Plants.updateOne({ _id, owner: email }, { $set: updates });
  if (!r.matchedCount) { return res.status(404).json({ error: "Not found" }); }
  res.json({ success: true });
});

api.delete("/plants/:id", checkAuth, async (req, res) => {
  let email = res.locals.user.email;
  let _id = new ObjectId(req.params.id);
  let r = await Plants.deleteOne({ _id, owner: email });
  if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

api.post("/google", async (req, res) => {
  let { idToken } = req.body;
  let client = new OAuth2Client();
  let data;
  try {
    let login = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
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

  let apiKey = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1d" });
  res.json({ email: user.email, apiKey });
});

api.get("/protected", checkAuth, (req, res) => {
  res.json({ message: `Logged in as ${res.locals.user.email}` });
});

api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
