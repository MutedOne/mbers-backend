
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"

const projectRoute = new Elysia()
.guard({
  body:t.Optional(t.Object({
    page:t.Optional(t.Any()||t.Number()),
    id:t.Optional( t.Number()),
    user:t.Optional(t.Number()),
    search:t.Optional(t.String()),
    idquery:t.Optional( t.Object({
      code:t.Optional(t.String()),
      name:t.Optional(t.String()),
      contact:t.Optional(t.String()),
      id:t.Optional(t.Number()),
    }))
  })),
  query:t.Optional(t.Object({
    code:t.Optional(t.String()),
    name:t.Optional(t.String()),
    contact:t.Optional(t.String()),
    id:t.Optional(t.Number()),
  }))  
}, app => app
.post('/project', ({body,query}) =>{
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

  if(query.code!=undefined || query.name!=undefined || query.contact!=undefined){
     cachekey ='getProject:code:'+query.code+':name:'+query.name+':contact:'+query.contact+':page='+ (isNaN(body.page)?1:body.page)
     str = "where code like '%"+query.code+"%'"
     if(query.name !=''){
       str+=" and name like '%"+query.name+"%'"
     }
     if(query.contact !=''){
      str+=" and contact like '%"+query.contact+"%'"
    }
  }else{
    cachekey ='getProject:code:'+query.code+':name:'+query.name+':contact:'+query.contact+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  project '+str+') as project WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/projecttotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
 
   if(query.code!=undefined || query.name!=undefined || query.contact!=undefined){
     cachekey ='getProjectTotal:code:'+query.code+':name:'+query.name+':contact:'+query.contact+':page='+ (isNaN(body.page)?1:body.page)
     str = "where code like '%"+query.code+"%'"
     if(query.name !=''){
       str+=" and name like '%"+query.name+"%'"
     }
     if(query.contact !=''){
      str+=" and contact like '%"+query.contact+"%'"
    }
  }else{
    cachekey ='getProjectTotal:code:'+query.code+':name:'+query.name+':contact:'+query.contact+':page='+ (isNaN(body.page)?1:body.page)
  }
   return querycache(cachekey,  'select count(id) as total from project '+str,[]).then((data)=>{
     return data[0].total
   })
 })
.post('/getIdProject', ({body})=>{
  return querycache('getProjectId:id:'+body.id,  'select * from project where id=?',[body.id])
})
.post('/createProject', ({body})=>{
  deleteKeysByPattern('*getProjectTotal*')
  deleteKeysByPattern('*getProject:*')
  deleteKeysByPattern('*getProjectPrint*')
  deleteKeysByPattern('*getTicketproid*')
  return querycache('',  ' INSERT INTO project (code,name,contact) VALUES ( ?,?,?)',[body.idquery?.code,body.idquery?.name,body.idquery?.contact])
}
)
.post('/updateProject', ({body})=>{
  deleteKeysByPattern('*getProjectId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getProject:*')
  deleteKeysByPattern('*getTicketproid*')
  return querycache('',  ' UPDATE project SET code=?, name=?,contact=? WHERE id=?;',[body.idquery?.code,body.idquery?.name,body.idquery?.contact,body.idquery?.id])
})
.post('/deleteProject', ({body})=>{
  deleteKeysByPattern('*getProjectId:id:'+body.id)
  deleteKeysByPattern('*getProject:*')
  deleteKeysByPattern('*getProjectTotal*')
  deleteKeysByPattern('*getProjectPrint*')
  deleteKeysByPattern('*getTicketproid*')
  return querycache('',  ' DELETE FROM project WHERE id=?;',[body.id])
})
.get('/printProject', ({query})=>{
  let cachekey =''
  let str =''
  if(query.code!=undefined || query.name!=undefined || query.contact!=undefined){
     cachekey ='getProjectPrint:code:'+query.code+':name:'+query.name+':contact:'+query.contact
     str = "where code like '%"+query.code+"%'"
     if(query.name !=''){
       str+=" and name like '%"+query.name+"%'"
     }
     if(query.contact !=''){
      str+=" and contact like '%"+query.contact+"%'"
    }
  }else{
    cachekey ='getProjectPrint:code:'+query.code+':name:'+query.name+':contact:'+query.contact
  }
  return querycache(cachekey,  'Select code,name,contact from project '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any)=>  dataarr.push(Object.values(a)) )
    return exportCache('getProjectPrintData:code:'+query.code+':name:'+query.name+':contact:'+query.contact,dataarr)
  })
}))
export{
  projectRoute
}