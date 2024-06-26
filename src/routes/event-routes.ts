import { Request, Response } from "express";
import {
  ComentariiModel,
  EventModel,
  addNewEvent,
  addParticipant,
  findEventById,
  getAll,
  searchEvents,
  updateComByID,
} from "../db/events";
import { isRequestValid } from "../util/methods";
import fs from "fs";
import { addSavedEvent, findUserById, getUserByEmail } from "../db/users";
import axios from "axios";
type EventToSend = {
  id: string;
  creatorId: string;
} & EventModel;

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
type ParticipantsRequest = {
  eventId: string;
  userId: string;
};
type AddCommentRequest = {
  eventId: string;
  authorId: string;
  author: string;
  date: number;
  message: string;
};
type PostComment = {
  authorId: string;
  author: string;
  date: number;
  message: string;
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
    comentarii: Array(),
  };
  const newEvent = await addNewEvent(eventToAdd);
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
  const allEvents = await getAll();

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
      comentarii: event.comentarii,
    };

    eventsToSend.push(eventToAdd);
  }

  res.status(200).json(eventsToSend);
};
export const getEventById = async (req: Request, res: Response) => {
  const getEventId = { eventId: req.query.eventId as string };
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
    comentarii: event.comentarii,
  };
  res.json(eventToAdd);
};
export const addNewComment = async (req: Request, res: Response) => {
  const commentRequest: AddCommentRequest = {
    eventId: req.body.eventId,
    author: req.body.author,
    authorId: req.body.authorId,
    date: req.body.date,
    message: req.body.message,
  };

  if (!isRequestValid(commentRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  const commentToAdd: PostComment = {
    authorId: commentRequest.authorId,
    author: commentRequest.author,
    date: commentRequest.date,
    message: commentRequest.message,
  };
  const eventToAddCom = (await findEventById(commentRequest.eventId))!;
  const comments = eventToAddCom.comentarii;
  comments.push(commentToAdd);
  await updateComByID(commentRequest.eventId, comments);
  res.json(eventToAddCom);
};
export const addNewParticipant = async (req: Request, res: Response) => {
  const participantsRequest: ParticipantsRequest = {
    eventId: req.body.eventId as string,
    userId: req.body.userId as string,
  };

  const event = await findEventById(participantsRequest.eventId);
  const user = await findUserById(participantsRequest.userId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  if (!user) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (event.participanti.includes(participantsRequest.userId)) {
    return res
      .status(400)
      .json({ message: "User already participating in the event" });
  }
  const participantiToAdd = [...event.participanti, participantsRequest.userId];
  const response = await addParticipant(
    participantsRequest.eventId,
    participantiToAdd
  );

  console.log(user);
  const savedEvents: string[] = [
    ...user.savedEvents,
    participantsRequest.eventId,
  ];
  console.log(savedEvents);
  const responseUser = await addSavedEvent(
    participantsRequest.userId,
    savedEvents
  );

  console.log(responseUser);
  res.status(200).send("Utilizator adaugat cu succes");
};
export const deleteParticipant = async (req: Request, res: Response) => {
  const participantsRequest: ParticipantsRequest = {
    eventId: req.body.eventId as string,
    userId: req.body.userId as string,
  };

  const event = await findEventById(participantsRequest.eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (!event.participanti.includes(participantsRequest.userId)) {
    return res
      .status(400)
      .json({ message: "User is not a participant in the event" });
  }

  const updatedParticipants = event.participanti.filter(
    (id) => id !== participantsRequest.userId
  );

  await addParticipant(participantsRequest.eventId, updatedParticipants);

  res.json(updatedParticipants);
};

export const searchedEvents = async (req: Request, res: Response) => {
  const searchQuery = req.query.searchQuery as string;
  if (!searchQuery) {
    const allEvents = await getAll();

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
        comentarii: event.comentarii,
      };

      eventsToSend.push(eventToAdd);
    }

    res.json(eventsToSend);
  } else {
    try {
      const events: any[] = await searchEvents(searchQuery);

      const mappedEvents = events.map((event) => ({
        id: event.id,
        creatorId: event.creatorId,
        creatorEmail: event.creatorEmail,
        titlu: event.titlu,
        tip: event.tip,
        dataTimp: event.dataTimp,
        adresa: event.adresa,
        oras: event.oras,
        descriere: event.descriere,
        coordonate: event.coordonate,
        participanti: event.participanti,
        comentarii: event.comentarii,
      }));

      res.json(mappedEvents);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: "Error searching events", error: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  }
};
export const getRecomendedEvents = async (req: Request, res: Response) => {
  const user_id = req.query.userId;

  const response = await axios.get(
    `http://127.0.0.1:5000/recommend/${user_id}`
  );
  const recommendEvents = response.data;

  let eventsToSend = [];
  for (let i = 0; i < recommendEvents.length; i++) {
    const event = await findEventById(recommendEvents[i]);
    const eventToPush = {
      id: event?._id,
      creatorEmail: event?.creatorEmail,
      titlu: event?.titlu,
      tip: event?.tip,
      dataTimp: event?.dataTimp,
      adresa: event?.adresa,
      oras: event?.oras,
      descriere: event?.descriere,
      coordonate: event?.coordonate,
      participanti: event?.participanti,
      comentarii: event?.comentarii,
    };
    eventsToSend.push(eventToPush);
  }
  res.json(eventsToSend);
};
