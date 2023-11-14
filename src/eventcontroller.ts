
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"

const eventRoute = new Elysia()
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
.post('/event',  ({body,query}) =>{
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
     cachekey ='getEvent:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getEvent:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  eventmaster '+str+') as eventmaster WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/eventtotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
   if(query.ttype!=undefined || query.desc!=undefined ){
     cachekey ='getEventTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getEventTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
   return querycache(cachekey,  'select count(id) as total from eventmaster '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdEvent', ({body})=>{
  return querycache('getEventId:id:'+body.id,  'select * from eventmaster where id=?',[body.id])
})
.post('/createEvent', ({body})=>{
  deleteKeysByPattern('*getEventTotal*')
  deleteKeysByPattern('*getEvent:*')
  deleteKeysByPattern('*getEventPrint*')
  deleteKeysByPattern('*getTicketeventid*')
  
  return querycache('',  ' INSERT INTO eventmaster (ttype,description) VALUES ( ?,?)',[body.idquery?.ttype,body.idquery?.description])
})
.post('/updateEvent', ({body})=>{
  deleteKeysByPattern('*getEventId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getEvent:*')
  deleteKeysByPattern('*getTicketeventid*')
  return querycache('',  ' UPDATE eventmaster SET ttype=?, description=? WHERE id=?;',[body.idquery?.ttype,body.idquery?.description,body.idquery?.id])
})
.post('/deleteEvent', ({body})=>{
  deleteKeysByPattern('*getEventId:id:'+body.id)
  deleteKeysByPattern('*getEvent:*')
  deleteKeysByPattern('*getEventTotal*')
  deleteKeysByPattern('*getEventPrint*')
  deleteKeysByPattern('*getTicketeventid*')
  return querycache('',  ' DELETE FROM eventmaster WHERE id=?;',[body.id])
})
.get('/printEvent', ({query})=>{
  let cachekey =''
  let str =''

  if(query.ttype!=undefined || query.desc!=undefined ){
    cachekey ='getEventPrint:type:'+query.ttype+':desc:'+query.desc
    str = "where ttype like '%"+query.ttype+"%'"
    if(query.desc !=''){
      str+=" and description='"+query.desc+"'"
    }
 }else{
   cachekey ='getEventPrint:type:'+query.ttype+':desc:'+query.desc
 }
  return querycache(cachekey,  'Select ttype,description from eventmaster '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getEventPrintData:type:'+query.ttype+':desc:'+query.desc,dataarr)
  })
}))
export{
  eventRoute
}