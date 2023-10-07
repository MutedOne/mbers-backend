import { createClient } from "redis";
import {deleteKeysByPattern} from './queryconcept'
const schedule = require('node-schedule');
const redisClient = createClient();
redisClient
 schedule.scheduleJob('00 00 00 * * *', ()=>{
    console.log("end of day")
    deleteKeysByPattern('*prio*')
    deleteKeysByPattern('*schedule*')
    deleteKeysByPattern('*projectView*')
    deleteKeysByPattern('*projectStatus*')
    deleteKeysByPattern('*topAch*')
    deleteKeysByPattern('*delay*')
});
