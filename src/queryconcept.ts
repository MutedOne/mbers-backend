const {db} =require('./setup.js')
import { createClient } from "redis";
import  { Redis } from 'ioredis'

const redisClient = createClient();
redisClient
.on('error', err => console.log('Redis Client Error', err))
.connect();
async function querycache(cachekey,query,queryparam){
  if(cachekey ==''){
   return queryAll(query,queryparam)
  }else{
    try{
      const value = await redisClient.get(cachekey);
     
      if(value){
          return JSON.parse(value)
      }else{
          const result= queryAll(query,queryparam)
          await redisClient.set(cachekey,JSON.stringify(await result) );
        
          return result
      }
    }catch(err){
        console.log('error')
    }
  }
}

async function deleteKeysByPattern(pattern) {

  const redis = new Redis(); // Connect to your Redis server

  var stream = redis.scanStream({ match: pattern,count: 100 });
  
var pipeline = redis.pipeline()
var localKeys = [];
stream.on('data', function (resultKeys) {

  for (var i = 0; i < resultKeys.length; i++) {

    localKeys.push(resultKeys[i]);
    pipeline.del(resultKeys[i]);
  }
  if(localKeys.length > 100){
    pipeline.exec(()=>{console.log("one batch delete complete")});
    localKeys=[];
    pipeline = redis.pipeline();
  }
});
stream.on('end', function(){
  pipeline.exec(()=>{console.log("final batch delete complete")});
});
stream.on('error', function(err){
  console.log("error", err)
})
}

async function logout(){
  db.end()
  await redisClient.disconnect();
}
async function queryAll(query:string,queryparam){
  
    try{
      const [rows, fields] =  await db.execute(query,queryparam)
      // db.end()
    return rows
        // return new Promise((resolve, reject) => {
        //     const results = [];
       
             
        //       db.getConnection((err, con) => {
        //         if (err) {
        //           console.error('Error acquiring a database connection:', err);
        //           return;
        //         }else{
        //           con.query(query, { stream: true })
        //           .stream()
        //           .on('data', (row) => {
        //             // Process each row here
        //             results.push(row);
        //           })
        //           .on('end', () => {
        //             // All rows have been processed
        //             con.release(); // Release the connection when done
        //             resolve(results); // Resolve the Promise with the results
        //           })
        //           .on('error', (err) => {
        //             // Handle any errors that occur during streaming
        //             console.error('Error during stream:', err);
        //             con.release(); // Make sure to release the connection in case of an error
        //             reject(err); // Reject the Promise in case of an error
        //           });
        //           // con.release();
        //         }
          
        //       })
                   
        //   });
    }catch(err){
        console.log(err)
    }
    
}

export{
  querycache,
  queryAll,
  deleteKeysByPattern,
  logout
}