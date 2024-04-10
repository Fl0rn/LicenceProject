import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import { MONGO_URL, PORT } from "./util/constants";
import { createUser, getUserInfo, logUserIn } from "./routes/user-routes";

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(bodyParser.json());

//Endpoints


app.post("/addUser",createUser)
app.post("/login",logUserIn)
app.get("/getUserByEmail",getUserInfo);
app.listen(PORT,"192.168.0.109", () => {
  console.log("Server started on localhost:3000");
});

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));
