import mongoose from "mongoose";
export interface EventModel {
    imagine: string;
    titlu: string;
    tip: string;
    dataTimp: number;
    adresa: string;
    oras: string;
    descriere: string;
    coordonate: [number,number]
}
const eventInfoSchema = new mongoose.Schema({
    imagine:{type:String, required: true},
    titlu:{type:String, required: true},
    tip:{type:String, required: true},
    dataTimp:{type:Number, required: true},
    adresa:{type:String, required: true},
    oras:{type:String, required: true},
    descriere:{type:String, required:true},
    coordonate:{type:[Number,Number],required:true},
})
const Event = mongoose.model("Event",eventInfoSchema);
export const addNewEvent = async (eventToAdd: EventModel) =>{
    const newEvent = new Event(eventToAdd);
    return newEvent.save();
}
export const getAll= () =>{
    return Event.find()
}