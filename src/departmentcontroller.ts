
import Elysia, { t } from "elysia";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"


const deptRoute = new Elysia()
.guard({
  body:t.Optional(t.Object({
    page:t.Optional(t.Any()||t.Number()),
    id:t.Optional( t.Number()),
    user:t.Optional(t.Number()),
    search:t.Optional(t.String()),
    dept:t.Optional( t.String()),
    team:t.Optional( t.Any()),
  })),
  query:t.Optional(t.Object({
    dept:t.Optional(t.String()),

  }))  
}, app => app
.post('/department', ({body,query}) =>{
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

  if( query.dept!=undefined ){
     cachekey ='getDept:dept:'+query.dept+':page:'+ (isNaN(body.page)?1:body.page)
     str = "where dept like '%"+query.dept+"%'"
  }else{
    cachekey ='getDept:dept:'+query.dept+':page='+ (isNaN(body.page)?1:body.page)
  }
 return querycache(cachekey,  'select * from (select *,row_number() over( order by id desc) as rn from  department '+str+') as department WHERE rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/departmenttotal', ({body,query}) =>{
  let cachekey =''
   let str =''
 
   if( query.dept!=undefined ){
      cachekey ='getDeptTotal:dept:'+query.dept+':page:'+ (isNaN(body.page)?1:body.page)
      str = "where dept like '%"+query.dept+"%'"
   }else{
     cachekey ='getDeptTotal:dept:'+query.dept+':page='+ (isNaN(body.page)?1:body.page)
   }
   return querycache(cachekey,  'select count(id) as total from department '+str,[]).then((data)=>{
     return data[0].total
   })
   
 })
.post('/getIdDept', ({body})=>{
  return querycache('getDeptId:id:'+body.id,  'select * from department where id=?',[body.id])
}
)
.post('/createDept', ({body})=>{
  deleteKeysByPattern('*getDeptTotal*')
  deleteKeysByPattern('*getDept:*')
  deleteKeysByPattern('*getDeptPrint*')
  deleteKeysByPattern('*getAccountdept*')
  
  return querycache('',  ' INSERT INTO department (dept) VALUES ( ?)',[body.dept])
})
.post('/updateDept', ({body})=>{

  querycache('',  ' DELETE FROM deptTeam WHERE deptid=?;',[body.id])
  .then(()=>{
    body.team.forEach((val:any)=>{
      if(JSON.parse(val.deptmemberid).length>0){
        JSON.parse(val.deptmemberid).forEach((val2:any)=>{
          querycache('',' INSERT INTO deptTeam (deptid,depthead,deptmemberid) VALUES (?,?,?);',[body.id,val.depthead,val2])
        })
      }else{
        querycache('',' INSERT INTO deptTeam (deptid,depthead,deptmemberid) VALUES (?,?,?);',[body.id,val.depthead,0])
      }
    
    })
  })

  querycache('',  ' UPDATE department SET dept=? WHERE id=?;',[body.dept,body.id])
  deleteKeysByPattern('*getDeptId:id:'+body.id)
  deleteKeysByPattern('*getDept:*')
  deleteKeysByPattern('*getDeptTeam:id:'+body.id)

  return
})
.post('/deleteDept', ({body})=>{
  deleteKeysByPattern('*getDeptId:id:'+body.id)
  deleteKeysByPattern('*getDept:*')
  deleteKeysByPattern('*getDeptTotal*')
  deleteKeysByPattern('*getDeptPrint*')
  return querycache('',  ' DELETE FROM department WHERE id=?;',[body.id])
})
.get('/printDept', ({body,query})=>{
  let cachekey =''
  let str =''

  if( query.dept!=undefined ){
    cachekey ='getDeptPrint:dept:'+query.dept
    str = "where dept like '%"+query.dept+"%'"
 }else{
   cachekey ='getDeptPrint:dept:'+query.dept
 }
  return querycache(cachekey,  'Select dept from department '+str,[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any)=>  dataarr.push(Object.values(a)) )
    return exportCache('getDeptPrintData:dept:'+query.dept,dataarr)
  })
})
.post('/alluserid', ({body})=>{
  return querycache('getDeptUser:id:'+body.id,  'select * from account where deptid=? limit 5',[body.id])
})
.post('/allteam', ({body})=>{
  return querycache('getDeptTeam:id:'+body.id,  'select  depthead,concat(\'[\',GROUP_CONCAT(deptmemberid SEPARATOR \',\'),\']\')  as deptmemberid  from deptTeam where deptid=? group by deptid,depthead',[body.id])
}))
export{
  deptRoute
}