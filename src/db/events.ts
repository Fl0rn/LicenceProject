import mongoose from "mongoose";
export interface ComentariiModel {
  authorId: string;
  author: string;
  date: number;
  message: string;
}
export interface EventModel {
  creatorEmail: string;
  titlu: string;
  tip: string;
  dataTimp: number;
  adresa: string;
  oras: string;
  descriere: string;
  coordonate: number[];
  participanti: Array<string>;
  comentarii: Array<ComentariiModel>;
}
const PostCommentSchema = new mongoose.Schema<ComentariiModel>({
  authorId: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Number, required: true },
  message: { type: String, required: true },
});
const eventInfoSchema = new mongoose.Schema({
  creatorEmail: { type: String, required: true },
  titlu: { type: String, required: true },
  tip: { type: String, required: true },
  dataTimp: { type: Number, required: true },
  adresa: { type: String, required: true },
  oras: { type: String, required: true },
  descriere: { type: String, required: true },
  coordonate: { type: [Number] },
  participanti: { type: [String], required: true },
  comentarii: { type: [PostCommentSchema], required: true },
});
const Event = mongoose.model("Event", eventInfoSchema);
export const addNewEvent = async (eventToAdd: EventModel) => {
  const newEvent = new Event(eventToAdd);
  return newEvent.save();
};
export const getAll = () => {
  return Event.find();
};
export const findEventById = (eventId: string) => Event.findById(eventId);

export const updateComByID = (
  eventId: string,
  comments: Array<ComentariiModel>
) => Event.findByIdAndUpdate(eventId, { comentarii: comments });

export const addParticipant = (id: String, participanti: string[]) =>
  Event.findByIdAndUpdate(id, { participanti: participanti });

export async function searchEvents(searchQuery: string) {
  if (searchQuery.length === 0) return [];

  const results = await Event.find({
    titlu: { $regex: searchQuery, $options: "i" },
  });

  

  return results;
}