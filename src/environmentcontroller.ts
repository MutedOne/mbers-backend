
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"

const environmentRoute = new Elysia()
.guard({
  body:t.Optional(t.Object({
    page:t.Optional(t.Any()||t.Number()),
    id:t.Optional( t.Number()),
    user:t.Optional(t.Number()),
    search:t.Optional(t.String()),
    idquery:t.Optional( t.Object({
      ttype:t.Optional(t.String()),
      description:t.Optional(t.String()),
      id:t.Optional(t.Number()),
    }))
  })),
  query:t.Optional(t.Object({
    ttype:t.Optional(t.String()),
    desc:t.Optional(t.String()),
    id:t.Optional(t.Number()),
  }))  
}, app => app
.post('/env',  ({body,query}) =>{
  const page = body.page; // Assuming body.page contains the current page number

  const pageSize = 20; // Number of items per page
  
  let startItem, endItem;
  
  if (page === 1) {
    startItem = 1;
    endItem = 20;
  } else {
    startItem = (page - 1) * pageSize + 1;
    endItem = startItem + pageSize - 1;
  }

  let cachekey =''
  let str =''

  if(query.ttype!=undefined || query.desc!=undefined ){
     cachekey ='getEnv:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getEnv:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  environment '+str+') as environment WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/envtotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
   if(query.ttype!=undefined || query.desc!=undefined ){
     cachekey ='getEnvTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getEnvTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
   return querycache(cachekey,  'select count(id) as total from environment '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdEnv', ({body})=>{
  return querycache('getEnvId:id:'+body.id,  'select * from environment where id=?',[body.id])
})
.post('/createEnv', ({body})=>{
  deleteKeysByPattern('*getEnvTotal*')
  deleteKeysByPattern('*getEnv:*')
  deleteKeysByPattern('*getEnvPrint*')
  deleteKeysByPattern('*getTicketenvid*')
  return querycache('',  ' INSERT INTO environment (ttype,description) VALUES ( ?,?)',[body.idquery?.ttype,body.idquery?.description])
})
.post('/updateEnv', ({body})=>{
  deleteKeysByPattern('*getEnvId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getEnv:*')
  deleteKeysByPattern('*getTicketenvid*')
  return querycache('',  ' UPDATE environment SET ttype=?, description=? WHERE id=?;',[body.idquery?.ttype,body.idquery?.description,body.idquery?.id])
})
.post('/deleteEnv', ({body})=>{
  deleteKeysByPattern('*getEnvId:id:'+body.id)
  deleteKeysByPattern('*getEnv:*')
  deleteKeysByPattern('*getEnvTotal*')
  deleteKeysByPattern('*getEnvPrint*')
  deleteKeysByPattern('*getTicketenvid*')
  return querycache('',  ' DELETE FROM environment WHERE id=?;',[body.id])
})
.get('/printEnv', ({body,query})=>{
  let cachekey =''
  let str =''

  if(query.ttype!=undefined || query.desc!=undefined ){
    cachekey ='getEnvPrint:type:'+query.ttype+':desc:'+query.desc
    str = "where ttype like '%"+query.ttype+"%'"
    if(query.desc !=''){
      str+=" and description='"+query.desc+"'"
    }
 }else{
   cachekey ='getEnvPrint:type:'+query.ttype+':desc:'+query.desc
 }
  return querycache(cachekey,  'Select ttype,description from environment '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any)=>  dataarr.push(Object.values(a)) )
    return exportCache('getEnvPrintData:type:'+query.ttype+':desc:'+query.desc,dataarr)
  })
}))
export{
  environmentRoute
}