
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"
var jwt = require('jsonwebtoken');
const userRoute = new Elysia()
.guard({
  body:t.Optional( t.Object({
    user:t.Optional(t.Number()),
    type:t.Optional(t.Any()),
    username:t.Optional(t.String()),
    password:t.Optional(t.String()),
    page:t.Optional(t.Any()||t.Number()),
    id:t.Optional(t.Number()),
    search:t.Optional(t.String()),
    dept:t.Optional(t.String()),
    idquery:t.Optional( t.Object({
      username:t.Optional(t.String()),
      name:t.Optional(t.String()),
      password:t.Optional(t.String()),
      deptid:t.Optional(t.Number()),
      dept:t.Optional(t.String()),
      aa:t.Optional(t.Number()),
      ea:t.Optional(t.Number()),
      ma:t.Optional(t.Number()),
      ua:t.Optional(t.Number()),
      status:t.Optional(t.Number()),
      id:t.Optional(t.Number()),
    }))
  })),
  query:t.Object({
    username:t.Optional(t.String()),
    password:t.Optional(t.String()),
    name:t.Optional(t.String()),
    aa:t.Optional(t.String()),
    ea:t.Optional(t.String()),
    ma:t.Optional(t.String()),
    ua:t.Optional(t.String()),
    status:t.Optional(t.String()),
    dept:t.Optional(t.String()),
    page:t.Optional(t.String()),
  })
}, app => app
.post('/account', ({body,query}) =>{
  let pageSize = 20; // Number of items per page
  
  let startItem, endItem;
  
  if (body.page === 1) {
    startItem = 1;
    endItem = 20;
  } else {
    startItem = (body.page - 1) * pageSize + 1;
    endItem = startItem + pageSize - 1;
  }

  let cachekey =''
  let str =''

  if(query.username!=undefined || query.name!=undefined || query.aa!=undefined || query.ea!=undefined || query.dept!=undefined|| query.ma!=undefined || query.ua!=undefined || query.status!=undefined){
     cachekey ='getAccount:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status+':page='+ (isNaN(body.page)?1:body.page)
    str = "where username like '%"+query.username+"%'"
    if(query.name !=''){
      str+=" and name='"+query.name+"'"
    }
    if(query.aa !="0"){
      str+=" and aa="+query.aa
    }
    if(query.ea !="0"){
      str+=" and ea="+query.ea
    }
    if(query.ma !="0"){
      str+=" and ma="+query.ma
    }
    if(query.ua !="0"){
      str+=" and ua="+query.ua
    }
    if(query.status !="0"){
      str+=" and status="+query.status
    }
    if(query.dept !="0"){
      str+=" and deptid="+query.dept
    }
  }else{
    cachekey ='getAccount:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select account.*,department.dept from ( select deptid,id,username,name,IF(status =1, "Active", "Inactive") as status,IF(aa =1, "YES", "NO") as aa,IF(ea =1, "YES", "NO") as ea,IF(ma =1, "YES", "NO") as ma,IF(ua =1, "YES", "NO") as ua, ROW_NUMBER() OVER (order by id desc) as rn from account '+str+') as account left join department on account.deptid = department.id WHERE account.rn>=? and account.rn<=?  ORDER BY account.rn ',[startItem,endItem])
  
})
.post('/accounttotal', ({body,query}) =>{

  let cachekey =''
   let str =''
 
   if(query.username!=undefined || query.name!=undefined || query.aa!=undefined || query.ea!=undefined || query.dept!=undefined || query.ma!=undefined || query.ua!=undefined || query.status!=undefined){
      cachekey ='getAccountTotal:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status+':page='+ (isNaN(body.page)?1:body.page)
      str = "where username like '%"+query.username+"%'"
      if(query.name !=''){
        str+=" and name='"+query.name+"'"
      }
     if(query.aa !="0"){
       str+=" and aa="+query.aa
     }
     if(query.ea !="0"){
       str+=" and ea="+query.ea
     }
     if(query.ma !="0"){
       str+=" and ma="+query.ma
     }
     if(query.ua !="0"){
       str+=" and ua="+query.ua
     }
     if(query.status !="0"){
       str+=" and status="+query.status
     }
     if(query.dept !="0"){
       str+=" and deptid="+query.dept
     }
   }else{
      cachekey ='getAccountTotal:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status+':page='+ (isNaN(body.page)?1:body.page)
   }
   return querycache(cachekey,  'select count(id) as total from account '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdUser', ({body})=>{
  return querycache('getAccountId:id:'+body.id,  'select account.*,department.dept from ( select * from account where id=? ) as account left join department on account.deptid = department.id',[body.id])
})
.post('/createUser', ({body})=>{
  deleteKeysByPattern('*getAccountTotal*')
  deleteKeysByPattern('*getAccount:*')
  deleteKeysByPattern('*getAccountPrint*')
  deleteKeysByPattern('*getDeptUser*')
  
  return querycache('',  ' INSERT INTO account (username, name, password, status, aa, ea,ma,ua,deptid) VALUES ( ?,?,MD5(?),?,?,?,?,?,?)',[body.idquery?.username,body.idquery?.name, body.idquery?.password,body.idquery?.status,body.idquery?.aa,body.idquery?.ea,body.idquery?.ma,body.idquery?.ua,body.idquery?.deptid])
})
.post('/updateUser', ({body})=>{
  deleteKeysByPattern('*getAccountId:id:'+body.id)
  deleteKeysByPattern('*getAccount:*')
  deleteKeysByPattern('*loginuser:username:'+body.idquery?.username)
  return querycache('',  ' UPDATE account SET username=?, name=?, password=?, status=?, aa=?, ea=?,ma=?,ua=?,deptid=? WHERE id=?;',[body.idquery?.username,body.idquery?.name,body.idquery?.password,body.idquery?.status,body.idquery?.aa,body.idquery?.ea,body.idquery?.ma,body.idquery?.ua,body.idquery?.deptid,body.idquery?.id])
})
.get('/printUsers', ({body,query})=>{

  let cachekey =''
  let str =''
  if(query.username!=undefined || query.name!=undefined || query.aa!=undefined || query.ea!=undefined || query.dept!=undefined || query.ma!=undefined || query.ua!=undefined || query.status!=undefined){
    cachekey ='getAccountPrint:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status
    str = "where username like '%"+query.username+"%'"
    if(query.name !=''){
      str+=" and name='"+query.name+"'"
    }
   if(query.aa !="0"){
     str+=" and aa="+query.aa
   }
   if(query.ea !="0"){
     str+=" and ea="+query.ea
   }
   if(query.ma !="0"){
     str+=" and ma="+query.ma
   }
   if(query.ua !="0"){
     str+=" and ua="+query.ua
   }
   if(query.status !="0"){
     str+=" and status="+query.status
   }
   if(query.dept !="0"){
     str+=" and deptid="+query.dept
   }
 }else{
    cachekey ='getAccountPrint:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':dept:'+query.dept+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status
 }
  return querycache(cachekey,  'Select username, name,status, aa, ea,ma,ua from account '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getAccountPrintData:username:'+query.username+':name:'+query.name+':aa:'+query.aa+':ea:'+query.ea+':ma:'+query.ma+':ua:'+query.ua+':status:'+query.status,dataarr)
  })

})
.post('/alldept', ({body})=>{
  return querycache('getAccountdept:dept:'+body.dept,  "select * from department where dept like '%"+body.dept+"%' limit 5",[])
})
.post('/currentLogin', ({request})=>{
  
  var decoded = jwt.verify(request.headers.get('authorization'), Bun.env.SESSIONHASH);
  
  return decoded
})
)
export{
  userRoute
}