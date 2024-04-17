import { Request,Response } from "express";
import { addNewEvent, getAll } from "../db/events";
import { isRequestValid } from "../util/methods";
type CreateEventRequest = {
    imagine: string;
    titlu: string;
    tip: string;
    dataTimp: number;
    adresa: string;
    oras: string;
    descriere: string;
    coordonate: [number,number]
}
export const createEvent = async (req:Request, res:Response) => {
    const createEventRequest : CreateEventRequest ={
        imagine: req.body.imagine,
        titlu: req.body.titlu,
        tip: req.body.tip,
        dataTimp: req.body.dataTimp,
        adresa: req.body.adresa,
        oras: req.body.oras,
        descriere: req.body.descriere,
        coordonate:req.body.coordonate,


    }
    if (!isRequestValid(createEventRequest)) {
        res
          .status(400)
          .send("Request object does not have all the correct properties");
        return;
      }
      await addNewEvent(createEventRequest);
  res.send("Event added succesfully");
}
export const getAllEvents = async (req:Request, res:Response) =>{
  const events = await getAll()
  res.status(200).json(events)
}