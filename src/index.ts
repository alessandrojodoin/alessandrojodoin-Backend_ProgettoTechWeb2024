import express from "express";
//import dotenv from 'dotenv';
import 'dotenv/config'
import { Request, Response, NextFunction } from "express";


//dotenv.config({ path: '.env' });



const app = express();   

//error handler
app.use( (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
      code: err.status || 500,
      description: err.message || "An error occurred"
    });
  });
  