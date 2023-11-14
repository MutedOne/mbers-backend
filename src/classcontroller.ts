
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"


const classificationRoute = new Elysia()
.guard({
  body: t.Object({
      user:t.Optional(t.Number()),
      search:t.Optional(t.String()),
      page:t.Optional(t.Any()||t.Number()) ,
    
      id:t.Optional(t.Number()),
      idquery:t.Optional( t.Object({
        code:t.Optional(t.String()),
        description:t.Optional(t.String()),
        id:t.Optional(t.Number()),
      }))
  }),
  query: t.Object({
      code:t.Optional(t.String()),
      desc:t.Optional(t.String()),
      id:t.Optional(t.Number()),
  })
}, app => app
.post('/class', ({body,query}) =>{
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

  if(query.code!=undefined || query.desc!=undefined ){
     cachekey ='getClass:code:'+query.code+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where code like '%"+query.code+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getClass:code:'+query.code+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  classification '+str+') as classification WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/classtotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
   if(query.code!=undefined || query.desc!=undefined ){
     cachekey ='getClassTotal:code:'+query.code+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
     str = "where code like '%"+query.code+"%'"
     if(query.desc !=''){
       str+=" and description='"+query.desc+"'"
     }
  }else{
    cachekey ='getClassTotal:code:'+query.code+':desc:'+query.desc+':page='+ (isNaN(body.page)?1:body.page)
  }
   return querycache(cachekey,  'select count(id) as total from classification '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdClass', ({body})=>{
  return querycache('getClassId:id:'+body.id,  'select * from classification where id=?',[body.id])
})
.post('/createClass', ({body})=>{
  deleteKeysByPattern('*getClassTotal*')
  deleteKeysByPattern('*getClass:*')
  deleteKeysByPattern('*getClassPrint*')
  deleteKeysByPattern('*getTicketclassid*')
  
 
  return querycache('',  ' INSERT INTO classification (code,description) VALUES ( ?,?)',[body.idquery?.code,body.idquery?.description])
})
.post('/updateClass', ({body})=>{
  deleteKeysByPattern('*getClassId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getClass:*')
  deleteKeysByPattern('*getTicketclassid*')
  return querycache('',  ' UPDATE classification SET code=?, description=? WHERE id=?;',[body.idquery?.code,body.idquery?.description,body.idquery?.id])
})
.post('/deleteClass', ({body})=>{
  deleteKeysByPattern('*getClassId:id:'+body.id)
  deleteKeysByPattern('*getClass:*')
  deleteKeysByPattern('*getClassTotal*')
  deleteKeysByPattern('*getClassPrint*')
  deleteKeysByPattern('*getTicketclassid*')
  return querycache('',  ' DELETE FROM classification WHERE id=?;',[body.id])
})
.get('/printClass', ({body,query})=>{
  let cachekey =''
  let str =''

  if(query.code!=undefined || query.desc!=undefined ){
    cachekey ='getClassPrint:code:'+query.code+':desc:'+query.desc
    str = "where code like '%"+query.code+"%'"
    if(query.desc !=''){
      str+=" and description='"+query.desc+"'"
    }
 }else{
   cachekey ='getClassPrint:code:'+query.code+':desc:'+query.desc
 }
  return querycache(cachekey,  'Select code,description from classification '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getClassPrintData:code:'+query.code+':desc:'+query.desc,dataarr)
  })
}))
export{
  classificationRoute
}