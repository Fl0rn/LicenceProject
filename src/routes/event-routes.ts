import { Request, Response } from "express";
import { EventModel, addNewEvent, findEventById, getAll } from "../db/events";
import { isRequestValid } from "../util/methods";
import fs from "fs";
import { getUserByEmail } from "../db/users";
type CreateEventRequest = {
  creatorEmail: string;
  imagine: string;
  titlu: string;
  tip: string;
  dataTimp: number;
  adresa: string;
  oras: string;
  descriere: string;
  coordonate: number[];
};
export const createEvent = async (req: Request, res: Response) => {
  const createEventRequest: CreateEventRequest = {
    creatorEmail: req.body.creatorEmail,
    imagine: req.body.imagine,
    titlu: req.body.titlu,
    tip: req.body.tip,
    dataTimp: req.body.dataTimp,
    adresa: req.body.adresa,
    oras: req.body.oras,
    descriere: req.body.descriere,
    coordonate: req.body.coordonate,
  };
  if (!isRequestValid(createEventRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  const eventToAdd: EventModel = {
    ...createEventRequest,
    participanti: Array(),
    comentarii:Array(),
  };
  const newEvent = await addNewEvent(eventToAdd);
  //saving the event image
  const base64EventImage = createEventRequest.imagine;

  const dataWithoutPrefix = base64EventImage.replace(
    /^data:image\/\w+;base64,/,
    ""
  );
  const buffer = Buffer.from(dataWithoutPrefix, "base64");
  const filePath = `public/eventImages/${newEvent._id}.jpg`;

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Image saved successfully!");
    }
  });

  res.send("Event was added succesfully");
};

export const getAllEvents = async (req: Request, res: Response) => {
  type EventToSend = {
    id: string;
    creatorId: string;
  } & EventModel;

  const allEvents = await getAll();
  console.log(allEvents)
  const eventsToSend: Array<EventToSend> = Array();
  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];
    const curEventCreator = (await getUserByEmail(event.creatorEmail))!;

    const eventToAdd: EventToSend = {
      id: event._id.toString(),
      creatorEmail: event.creatorEmail,
      creatorId: curEventCreator._id.toString(),
      tip: event.tip,
      titlu: event.titlu,
      dataTimp: event.dataTimp,
      oras: event.oras,
      descriere: event.descriere,
      adresa: event.adresa,
      coordonate: event.coordonate,
      participanti: event.participanti,
      comentarii:event.comentarii,
    };

    eventsToSend.push(eventToAdd);
  }

  res.status(200).json(eventsToSend);
};
export const getEventById = async (req:Request, res:Response) =>{
  const getEventId = { eventId: req.query.eventId as string}
  if (!isRequestValid(getEventId)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  const event = (await findEventById(getEventId.eventId))!;

const eventToAdd = {
  id: event._id.toString(),
  creatorEmail: event.creatorEmail,
  tip: event.tip,
  titlu: event.titlu,
  dataTimp: event.dataTimp,
  oras: event.oras,
  descriere: event.descriere,
  adresa: event.adresa,
  coordonate: event.coordonate,
  participanti: event.participanti,
  comentarii:event.comentarii,
}
res.json(eventToAdd);

}
