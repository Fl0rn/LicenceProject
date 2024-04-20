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
} from "./routes/user-routes";
import { addNewEvent } from "./db/events";
import { createEvent, getAllEvents, getEventById } from "./routes/event-routes";

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

const profileImagesPath = "D:\\faculta\\AN3Sem2\\Licenta\\Licenta\\public\\profileImages";
const nophotoPath = "D:\\faculta\\AN3Sem2\\Licenta\\Licenta\\public\\nophoto.png";

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
app.listen(PORT, "192.168.0.127", () => {
  console.log("Server started on localhost:3000");
});

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));
