import express from "express";
import cors from "cors";
import 'dotenv/config'
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { ideaRouter } from "./routes/idea-router.js";
import { authRouter } from "./routes/auth-router.js";



//dotenv.config({ path: '.env' });



const app = express();   

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//Routers
app.use(ideaRouter);
app.use(authRouter);

//error handler
app.use( (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
      code: err.status || 500,
      description: err.message || "An error occurred"
    });
  });

  app.listen(process.env.PORT);
  