
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"

const actionRoute = new Elysia()
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
.post('/action', ({body,query}) =>{
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
     cachekey ='getAction:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getAction:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  action '+str+') as action WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/actiontotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
   if(query.ttype!=undefined || query.desc!=undefined ){
     cachekey ='getActionTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where ttype like '%"+query.ttype+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getActionTotal:type:'+query.ttype+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
   return querycache(cachekey,  'select count(id) as total from action '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdAction', ({body})=>{
  return querycache('getActionId:id:'+body.id,  'select * from action where id=?',[body.id])
})
.post('/createAction', ({body})=>{
  deleteKeysByPattern('*getActionTotal*')
  deleteKeysByPattern('*getAction:*')
  deleteKeysByPattern('*getActionPrint*')
  
  return querycache('',  ' INSERT INTO action (ttype,description) VALUES ( ?,?)',[body.idquery?.ttype,body.idquery?.description])
})
.post('/updateAction', ({body})=>{
  deleteKeysByPattern('*getActionId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getAction:*')

  return querycache('',  ' UPDATE action SET ttype=?, description=? WHERE id=?;',[body.idquery?.ttype,body.idquery?.description,body.idquery?.id])
})
.post('/deleteAction', ({body})=>{
  deleteKeysByPattern('*getActionId:id:'+body.id)
  deleteKeysByPattern('*getAction:*')
  deleteKeysByPattern('*getActionTotal*')
  deleteKeysByPattern('*getActionPrint*')
  return querycache('',  ' DELETE FROM action WHERE id=?;',[body.id])
})
.get('/printAction', ({body,query})=>{
  let cachekey =''
  let str =''

  if(query.ttype!=undefined || query.desc!=undefined ){
    cachekey ='getActionPrint:type:'+query.ttype+':desc:'+query.desc
    str = "where ttype like '%"+query.ttype+"%'"
    if(query.desc !=''){
      str+=" and description='"+query.desc+"'"
    }
 }else{
   cachekey ='getActionPrint:type:'+query.ttype+':desc:'+query.desc
 }
  return querycache(cachekey,  'Select ttype,description from action '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getActionPrintData:type:'+query.ttype+':desc:'+query.desc,dataarr)
  })
}))

export{
  actionRoute
}