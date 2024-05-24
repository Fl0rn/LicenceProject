import mongoose from "mongoose";

export interface PlangeriModel {
    accountName:string;
    accountId:string;
    title:string;
    description:string;
    status:string;
    latitude:number;
    longitude:number;
    adress:string;
    date:number
}
const plangeriSchema = new mongoose.Schema({
    accountName:{type:String,required:true},
    accountId:{type:String,required:true},
    title:{type:String,required:true},
    description:{type:String,required:true},
    status:{type:String,required:true},
    latitude:{type:Number,required:true},
    longitude:{type:Number,required:true},
    adress:{type:String,required:true},
    date:{type:Number,required:true},
})

const Plangere = mongoose.model("Plangeri",plangeriSchema);

export const addNewPlangere = async (plangereToAdd:PlangeriModel) =>{
    const newPlangere = new Plangere(plangereToAdd)
    return newPlangere.save();
}
export const getAllPlangerii = async()=>{
    return Plangere.find();
}
export const getPlangereByIdd = async (id:string) =>{
    return Plangere.findById(id);
}
export const updateStatus = async(id:string,status:string)=>{
    return Plangere.findByIdAndUpdate(id,{status:status})
}