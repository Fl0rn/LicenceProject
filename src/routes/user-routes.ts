import { Request, Response } from "express";
import { addNewUser, getUserByEmail } from "../db/users";
import { decryptPassword, isRequestValid } from "../util/methods";

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
  console.log(createUserRequest);
  await addNewUser(createUserRequest);
  res.send("User added succesfully");
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