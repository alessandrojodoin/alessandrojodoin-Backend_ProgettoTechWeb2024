import { JwtPayload } from "jsonwebtoken";
import { AuthController } from "../controllers/auth-controller.js";
import { Request, Response, NextFunction } from "express";
import { IdeaController } from "../controllers/idea-controller.js";
import { CommentController } from "../controllers/comment-controller.js";



export function enforceAuthentication(req: Request, res: Response, next: NextFunction): null {
  //const authHeader = req.headers['authorization'];
  //const token = authHeader?.split(' ')[1];
  const token = req.headers['authorization'];
  if(!token){
    next({status: 401, message: "Unauthorized"});
    return;
  }
  try{
    var decodedToken = AuthController.verifyToken(token) as JwtPayload;
  }
  catch(error: any){
    next({status: 401, message: "Unauthorized"});
  }
  
  req.body.username = decodedToken.user;
  next();
    
};

//Makes sure the request is processed only if the idea belongs to the user
export async function enforceIdeaAuthorization(req: Request, res: Response, next: NextFunction){
  const user = await AuthController.findUser(req.body.username);
  const idea = await IdeaController.findIdea(Number(req.params.id));

  if(idea === null){
    next({status: 404, message: "Idea was not found."});
  }

  if (idea.authorUsername !== user.username){
    next({status: 401, message: "Unauthorized"});
  }

  next();

}
