import { Request, Response } from "express";

import { isRequestValid } from "../util/methods";
import { RequestModel, addNewRequest, findRequestById, getRequestsForAccount, getRequestsForTownHall, updateRequestStatus } from "../db/requests";
import { findUserById, updateAcountType } from "../db/users";
type ReqRequest = {
  acountName: string;
  acountId: string;
  city:string;
};
type AccountUpgradeRequest ={
    townHallAccountId: string,
    requestId: string,
}
type RequestWithAccountId ={
  accountId:string
}
type UpgradeRequest = {
  requestId: string;
} & RequestModel;
export const addRequest = async (req: Request, res: Response) => {
  const requestRequest: ReqRequest = {
    acountName: req.body.acountName,
    acountId: req.body.acountId,
    city:req.body.city,
  };
 
  if (!isRequestValid(requestRequest)) {
    res
      .status(400)
      .send("Request object does not have all the correct properties");
    return;
  }
  const data = new Date();
  const requestToAdd: RequestModel = {
    ...requestRequest,
    date: data.getTime(),
    status: "PENDING",
  };
  const newReq = await addNewRequest(requestToAdd);
  res.json(newReq);
};
export const accountUpgradeRequestAction = async (
    req: Request,
    res: Response,
    mode: "accept" | "reject"
  ) => {
    const acceptUpgradeRequest: AccountUpgradeRequest = {
      townHallAccountId: req.body.townHallAccountId,
      requestId: req.body.requestId,
    };

    if (!isRequestValid(acceptUpgradeRequest)) {
      res
        .status(400)
        .send("Request object does not have all the correct properties");
      return;
    }
  
    const curUpgradeRequest = await findRequestById(
      acceptUpgradeRequest.requestId
    );
   
    if (!curUpgradeRequest) {
      res.status(400).send("Upgrade request does not exist");
      return;
    }
   
    const accountToUpgrade = await findUserById(curUpgradeRequest.acountId);
   
    if (!accountToUpgrade) {
      res.status(400).send("Account to upgrade does not exist");
      return;
    }
  
    const townHallAccount = await findUserById(
      acceptUpgradeRequest.townHallAccountId
    );
    if (
      !townHallAccount ||
     
      townHallAccount.oras !== curUpgradeRequest.city
    ) {
      res
        .status(400)
        .send("Account id is wrong or the account is managing another town hall");
      return;
    }
  
    if (mode === "accept") {
      await updateAcountType(curUpgradeRequest.acountId);
    
      await updateRequestStatus(
        curUpgradeRequest.id,
        "ACCEPTED"
      );
      res.send("Request accepted succesfully");
    } else {
      await updateRequestStatus(
        curUpgradeRequest._id.toString(),
        "REJECTED"
      );
      res.send("Request rejected succesfully");
    }
  };
  export const getAccountUpgradeRequests = async (
    req: Request,
    res: Response
  ) => {
    const requestsListRequest: RequestWithAccountId = {
      accountId: req.query.accountId as string,
    };
  
    if (!isRequestValid(requestsListRequest)) {
      res
        .status(400)
        .send("Request object does not have all the correct properties");
      return;
    }
  
    const user = await findUserById(requestsListRequest.accountId);
   
    if (!user) {
      res.status(400).send("This user does not exist");
      return;
    }
  
    let requests;
    if (user.acountType === 2) {
      requests = await getRequestsForTownHall(user.oras);
    } else {
  
      requests = await getRequestsForAccount(user.id);
      
    }
  
    const mappedResponse: Array<UpgradeRequest> = requests.map((request) => {
      return {
        requestId: request._id.toString(),
        acountId: request.acountId,
        acountName: request.acountName,
        city: request.city,
        date: request.date,
        status: request.status,
      };
    });
  
    res.json(mappedResponse);
  };