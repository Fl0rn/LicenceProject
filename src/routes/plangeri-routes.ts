import { Request, Response } from "express";
import {
  PlangeriModel,
  addNewPlangere,
  getAllPlangerii,
  getPlangereByIdd,
  updateStatus,
} from "../db/plangeri";
import { isRequestValid, reverseGeocoding } from "../util/methods";
import fs from "fs";
import { API_KEY } from "../util/constants";
type PlangeriRequest = {
  image: string;
  accountName: string;
  accountId: string;
  title: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
};
type PlangeriToSend = {
  id: string;
} & PlangeriModel;

export const createPlangere = async (req: Request, res: Response) => {
  const createPlangereRequest: PlangeriRequest = {
    accountName: req.body.accountName as string,
    accountId: req.body.accountId as string,
    image: req.body.image as string,
    title: req.body.title as string,
    description: req.body.description as string,
    latitude: req.body.latitude as number,
    longitude: req.body.longitude as number,
    status: req.body.status as string,
  };

  if (!isRequestValid(createPlangereRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }

  try {
    const address = await reverseGeocoding(
      createPlangereRequest.latitude,
      createPlangereRequest.longitude
    );

    const date = new Date();

    const plangereToAdd = {
      ...createPlangereRequest,
      adress: address,
      date: date.getTime(),
    };

    const newPlangere = await addNewPlangere(plangereToAdd);

    const base64EventImage = createPlangereRequest.image;
    const dataWithoutPrefix = base64EventImage.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const buffer = Buffer.from(dataWithoutPrefix, "base64");
    const filePath = `public/plangeriImages/${newPlangere._id}.jpg`;

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Image saved successfully!");
      }
    });

    res.json(newPlangere);
  } catch (error) {
    console.error("Error creating plangere:", error);
    res.status(500).send("Error creating plangere");
  }
};
export const getAllPlangeri = async (req: Request, res: Response) => {
  const allPlangeri = await getAllPlangerii();
  const plangeriToSend: Array<PlangeriToSend> = Array();
  for (let i = 0; i < allPlangeri.length; i++) {
    const event = allPlangeri[i];

    const plangereToAdd: PlangeriToSend = {
      id: event._id.toString(),
      accountName: event.accountName,
      accountId: event.accountId,
      title: event.title,
      description: event.description,
      status: event.status,
      latitude: event.latitude,
      longitude: event.longitude,
      date: event.date,
      adress: event.adress,
    };
    plangeriToSend.push(plangereToAdd);
  }
  res.status(200).json(plangeriToSend);
};
export const getPlangereById = async (req: Request, res: Response) => {
  const plangereId = req.query.plangereId as string;


  if (!isRequestValid(plangereId)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }

  const plangere = await getPlangereByIdd(plangereId);

  const plangereToSend = {
    id: plangere?._id,

    accountName: plangere?.accountName,
    accountId: plangere?.accountId,
    title: plangere?.title,
    description: plangere?.description,
    status: plangere?.status,
    latitude: plangere?.latitude,
    longitude: plangere?.longitude,
    adress: plangere?.adress,
    date: plangere?.date,
  };

  res.send(plangereToSend);
};

export const updatePlangereStatus = async (req:Request,res:Response)=>{
    const plangereId = req.body.plangereId;
    const status = req.body.status
    if (!isRequestValid(plangereId)) {
      res
        .status(400)
        .send("Request object does not have all the correct properties");
      return;
    }

     await updateStatus(plangereId,status);
     res.status(200).send("Plangere added succesfully")
}