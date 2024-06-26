import express from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import { MONGO_URL, PORT } from "./util/constants";
import {
  changeProfilePicture,
  createUser,
  getUserInfo,
  logUserIn,
  upgradeAcountType,
} from "./routes/user-routes";
import { addNewEvent } from "./db/events";
import { addNewComment, addNewParticipant, createEvent, deleteParticipant, getAllEvents, getEventById, getRecomendedEvents, searchedEvents } from "./routes/event-routes";
import { accountUpgradeRequestAction, addRequest, getAccountUpgradeRequests } from "./routes/request-routes";
import { createPlangere, getAllPlangeri, getPlangereById, updatePlangereStatus } from "./routes/plangeri-routes";

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

//Endpoints

app.use(express.static("public"));

app.use(
  "/eventImages",
  express.static(path.join(__dirname, "public", "eventImages"))
);
app.use(
  "/plangeriImages",
  express.static(path.join(__dirname, "public", "plangeriImages"))
);

const profileImagesPath = path.join(__dirname, "..", "public", "profileImages");
const nophotoPath =path.join(profileImagesPath, "nophoto.png")

app.use("/profileImages", (req, res, next) => {
  express.static(profileImagesPath)(req, res, (err) => {
    console.log(err?.message);
    res.sendFile(nophotoPath);
  });
});
app.post("/addUser", createUser);
app.post("/login", logUserIn);
app.get("/getUserByEmail", getUserInfo);
app.post("/addNewEvent", createEvent);
app.get("/getAllEvents", getAllEvents);
app.put("/updateProfilePicture", changeProfilePicture);
app.get("/getEventById",getEventById);
app.post("/addComent",addNewComment);
app.post("/upgradeAcountType", upgradeAcountType)
app.post("/addNewRequest",addRequest)
app.post("/acceptAccountUpgrade",(req, res) =>
  accountUpgradeRequestAction(req, res, "accept")
);
app.post("/rejectAccountUpgrade", (req, res) =>
  accountUpgradeRequestAction(req, res, "reject")
);
app.get("/getAllRequest",getAccountUpgradeRequests)
app.post("/addNewPlangere",createPlangere)
app.get("/getAllPlangeri",getAllPlangeri)
app.get("/getPlangereById",getPlangereById)
app.post("/updatePlangereStatus",updatePlangereStatus)
app.post("/addParicipant",addNewParticipant)
app.post("/deleteParticipant",deleteParticipant)
app.get("/getSearchedEvents",searchedEvents)
app.get("/getRecomandedEvents",getRecomendedEvents)
app.listen(PORT, "192.168.0.127", () => {
  console.log("Server started on localhost:3000");
});

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));
