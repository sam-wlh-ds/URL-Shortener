import express from 'express';
import { connectToDB, checkDBConnection } from './db/dbConnect.js';

import shorten from './routes/shorten.js';
import redirect from './routes/redirect.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/shorten", checkDBConnection, shorten);
app.use("/", checkDBConnection, redirect);

app.use((err,req,res,next) => {
    console.log(err);
    res.status((err.statusCode || 500)).json({message:err.message});
    res.end();
})

const PORT = process.env.PORT || 3000;
connectToDB().then(
  app.listen(PORT, ()=>{
      console.log(`Listening on PORT ${PORT}`);
  })
).catch(error => console.log(error));