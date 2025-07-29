import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();
import { connectToDB, checkDBConnection } from './db/dbConnect.js';
import { updateDBFromCache, updateCacheFromDB } from './db/dbUpdate.js';
import { refreshBlacklistFromSource } from './utils/urlSafety.js';

import shorten from './routes/shorten.js';
import redirect from './routes/redirect.js';
import analytics from './routes/analytics.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
  origin: process.env.BASEURL,
  credentials: true
}));

app.use("/shorten", checkDBConnection, shorten);
app.use("/analytics", checkDBConnection, analytics);
app.use("/", checkDBConnection, redirect);

app.use((err,req,res,next) => {
    console.log(err);
    res.status((err.statusCode || 500)).json({message:err.message});
})

const PORT = process.env.PORT || 3000;
connectToDB().then(
  app.listen(PORT, ()=>{
      console.log(`Listening on PORT ${PORT}`);
        console.log('Database connected. Scheduling cron jobs...');

        // --- Cron Job Scheduling ---

        // Schedule Update (every 6 hours)
        // cron.schedule('0 */6 * * *', async () => {
        cron.schedule('*/10 * * * *', async () => { // Testing (every 10 min)
            console.log('Starting scheduled cache refresh sequence...');
            try {
                console.log('Running updateDBFromCache...');
                await updateDBFromCache();
                console.log('updateDBFromCache completed.');

                console.log('Running updateCacheFromDB...');
                await updateCacheFromDB();
                console.log('updateCacheFromDB completed.');

                console.log('Running refreshBlacklistFromSource...');
                await refreshBlacklistFromSource();
                console.log('refreshBlacklistFromSource completed.');
                
                console.log('Cache refresh sequence completed successfully.');
            } catch (error) {
                console.error('Cache refresh sequence failed:', error);
            }
        }, {
            scheduled: true,
            timezone: process.env.TIMEZONE
        });

        console.log('Cron job scheduled.');
  })
).catch(error => console.log(error));