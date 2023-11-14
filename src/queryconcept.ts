const {db} =require('./setup.js')
import { createClient } from "redis";
import  { Redis } from 'ioredis'

const redisClient = createClient();
redisClient
.on('error', err => console.log('Redis Client Error', err))
.connect();
async function querycache(cachekey:string,query:string,queryparam:any[]){
  
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
async function exportCache(cachekey:string,result:string){
  
  const value = await redisClient.get(cachekey);
     
  if(value){
      return JSON.parse(value)
  }else{

      await redisClient.set(cachekey,JSON.stringify(await result) );
    
      return result
  }
}


async function deleteKeysByPattern(pattern:string) {

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

// async function logout(){
//   db.end()
//   await redisClient.disconnect();
// }
async function queryAll(query:string,queryparam:[]){
  
    try{
      const sql = db.format(query,queryparam)
      console.log(sql)
      const [rows, fields] =  await db.execute(query,queryparam)
      // console.log(rows)
       return rows
     
    }catch(err){
        console.log(err)
    }
    
}

export{
  querycache,
  queryAll,
  deleteKeysByPattern,
  exportCache
}