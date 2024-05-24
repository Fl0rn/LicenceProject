import { Request, Response } from "express";
import { UserInfoModel, addNewUser, getUserByEmail, updateAcountType, updateProfilePictureStatusById } from "../db/users";
import { decryptPassword, isRequestValid } from "../util/methods";
import fs from "fs";

type CreateUserRequest = {
  nume: string;
  email: string;
  cnp: string;
  oras: string;
  parola: string;
 
};
type LogInRequest = {
  email: string;
  parola: string;
};
type ProfilePictureRequest ={
  userId: string,
  base64Photo:string,
}
export const createUser = async (req: Request, res: Response) => {
  const createUserRequest: CreateUserRequest = {
    nume: req.body.nume,
    email: req.body.email,
    cnp: req.body.cnp,
    oras: req.body.oras,
    parola: req.body.parola,
   
  };
  if (!isRequestValid(createUserRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  
  const newUser:UserInfoModel = {...createUserRequest,acountType:0}
   const userSaved = await addNewUser(newUser);



  res.send(userSaved);
};


export const logUserIn = async (req: Request, res: Response) => {
  const logInRequest: LogInRequest = {
    email: req.body.email,
    parola: req.body.parola,
  };
  if (!isRequestValid(logInRequest)) {
    res
      .status(400)
      .send("Introduceti si mailul si parola");
    return;
  }
  const currUser = await getUserByEmail(logInRequest.email);
 
  if(!currUser){
    res.status(400).send("Nu exsita utilizator cu acest email");
    return;
  }
if(! await decryptPassword(logInRequest.parola,currUser.parola)){
  res.status(400).send("Ai gresit parola");
  return;
}
res.json(currUser);
};

export const getUserInfo = async (req:Request, res: Response) =>{
  const userEmail = req.query.email as string;
    if(!userEmail){
      res.status(400).send("Email nu exista");
      return
    }

    const userInfo = await getUserByEmail(userEmail);
    res.json(userInfo);


    
}
export const changeProfilePicture = async (req: Request, res: Response) => {
  const profilePictureRequest: ProfilePictureRequest = {
    userId: req.body.userId,
    base64Photo: req.body.base64Photo,
  };

 
  if (!isRequestValid(profilePictureRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }

  const base64ProfileImage = profilePictureRequest.base64Photo;

  const dataWithoutPrefix = base64ProfileImage.replace(
    /^data:image\/\w+;base64,/,
    ""
  );
  const buffer = Buffer.from(dataWithoutPrefix, "base64");
  const filePath = `public/profileImages/${profilePictureRequest.userId}.jpg`;

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Image saved successfully!");
    }
  });

  await updateProfilePictureStatusById(profilePictureRequest.userId, true);
  res.send("Profile picture changed succesfully");

};
export const upgradeAcountType = async (req:Request,res:Response) => {
  const userId = req.body.userId;
  
  if (!isRequestValid(userId)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  await updateAcountType(userId);
  res.send("You are now a creator")
}