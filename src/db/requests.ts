import mongoose from "mongoose";

export interface RequestModel {
  acountName: string;
  acountId: string;
  date: number;
  status: string;
  city:string
}

const requestSchema = new mongoose.Schema({
  acountName: { type: String, required: true },
  acountId: { type: String, required: true },
  date: { type: Number, required: true },
  status: { type: String, required: true },
  city:{type:String,required:true}
});

const Request = mongoose.model("Request", requestSchema)

export const addNewRequest = async (reqToAdd:RequestModel) =>{
    const newRequest = new Request(reqToAdd)
    return newRequest.save();
}
export const findRequestById = async (requestId: string) =>
  Request.findById(requestId);


export const updateRequestStatus = async (requestId:string,status:string) =>{
  await Request.findOneAndUpdate({ _id: requestId }, { status: status });
}
export const getRequestsForAccount = (accountId: string) =>
  Request.find({ acountId: accountId }).sort({
    date: "descending",
  });

export const getRequestsForTownHall = (city: string) =>
  Request.find({
    city: city,
    status: "PENDING",
  });