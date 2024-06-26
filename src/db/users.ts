import mongoose from "mongoose";
import { encryptPassword } from "../util/methods";
export interface UserInfoModel {
  nume: string;
  email: string;
  cnp: string;
  oras: string;
  parola: string;
  acountType: number;
  savedEvents: [string];
}

const userInfoSchema = new mongoose.Schema({
  nume: { type: String, required: true },
  email: { type: String, required: true },
  cnp: { type: String, required: true },
  oras: { type: String, required: true },
  parola: { type: String, required: true },
  acountType: { type: Number, required: true },
  savedEvents: { type: [String], required: true },
});

const User = mongoose.model("User", userInfoSchema);

export const addNewUser = async (userToAdd: UserInfoModel) => {
  const newUser = new User(userToAdd);
  const cryptedPass = await encryptPassword(newUser.parola);
  newUser.parola = cryptedPass;
  return newUser.save();
};

export const getUserByEmail = (email: string) => {
  return User.findOne({ email: email });
};
export const findUserById = (id: string) => {
  return User.findOne({ _id: id });
};
export const updateProfilePictureStatusById = async (
  id: string,
  status: boolean
) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id },
      { $set: { hasProfilePicture: status } },
      { new: true, runValidators: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile picture status:", error);
    throw error;
  }
};
export const updateAcountType = (userId: string) =>
  User.findByIdAndUpdate(userId, { acountType: 1 });
export const addSavedEvent = async (id:string,savedEvents:string[]) => 
  User.findByIdAndUpdate(id,{savedEvents:savedEvents})
