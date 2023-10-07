const {db} =require('./setup.js')
import {querycache,deleteKeysByPattern} from "./queryconcept"

import file_system from 'node:fs'
import path from 'node:path'
const admz = require('adm-zip')
const excelJS = require("exceljs");
const {transporter} =require('./mailer.js')


const getschedule = ({body}) =>{
    const cachekey ='getschedule:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
    let page =0
  
   
    if(body.search!=''){
        str=" AND (name like '%"+body.search+"%' or description like '%"+body.search+"%') "
    }else{
        str=''
    }
    // return querycache('','select name,description,id from taskscheduled WHERE (part COLLATE utf8mb4_bin LIKE \'%,1,%\' OR userid = 1) '+str+' AND rn <= '+parseInt(((( isNaN(body.page)?1:body.page)) * 20))+' ORDER BY rn DESC LIMIT 20;')
    return querycache(cachekey,'SELECT task1.name, task1.description, task1.id FROM (SELECT name, description, id, projid, userid, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM task WHERE status=1 and donedate IS NULL AND date = CURRENT_DATE and userid =? '+str+') AS task1  left JOIN (SELECT projid FROM Projectpartcipants where userid =1) AS Projectpartcipants ON task1.projid = Projectpartcipants.projid WHERE task1.rn<=? ORDER BY task1.rn DESC LIMIT 20;',[body.user,parseInt(((( isNaN(body.page)?1:body.page)) * 20))])

}
const gettotalschedule = ({request,body}) =>{
    const cachekey ='gettotalschedule:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
    if(body.search !='' && body.search!=undefined){
        str=" AND (name like '%"+body.search+"%' or description like '%"+body.search+"%')"
    }else{
        str=''
    }
    
    return querycache(cachekey,' SELECT count(*) as total FROM (SELECT projid FROM task WHERE status=1 and donedate IS NULL AND date = CURRENT_DATE and userid =?'+str+' ) AS task1  LEFT JOIN (SELECT projid FROM  Projectpartcipants where userid =?  ) AS Projectpartcipants  ON task1.projid = Projectpartcipants.projid',[body.user,+body.user])
    ?.then((data)=>{
        return data[0].total
    })
}

const getDone = ({body}) =>{
    const cachekey ='getDone:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
    
    if(body.search !=undefined ){
        str=" AND (name like '%"+body.search+"%' or description like '%"+body.search+"%') "
    }else{
        str=''
    }
    return querycache(cachekey,'SELECT task1.name, task1.description, task1.id FROM (SELECT name, description, id, projid, userid, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM task WHERE donedate is not null and userid =? '+str+') AS task1  left JOIN (SELECT projid FROM Projectpartcipants where userid =1) AS Projectpartcipants ON task1.projid = Projectpartcipants.projid WHERE task1.rn<=? ORDER BY task1.rn DESC LIMIT 20;',[body.user,parseInt(((( isNaN(body.page)?1:body.page)) * 20))])

}


const gettotaldone = ({body}) =>{
    const cachekey ='gettotaldone:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
  
    if(body.search !='' && body.search!=undefined){
        str=" AND (name like '%"+body.search+"%' )"
    }else{
        str=''
    }
    return querycache(cachekey,' SELECT count(*) as total FROM (SELECT projid FROM task WHERE donedate is not null and userid =? '+str+' ) AS task1  LEFT JOIN (SELECT projid FROM  Projectpartcipants where userid =?  ) AS Projectpartcipants  ON task1.projid = Projectpartcipants.projid',[body.user,+body.user])
    ?.then((data)=>{
    return data[0].total
    })
}

const updateUser = ({request}) =>{
   
    return db.none('UPDATE "Task" set name=${name} WHERE id=${id}' ,request.body)
    .then((data) => {
       
        
        // res.redirect("/aasda")
    })
  
}
const updateApprove = ({body}) =>{
   
    return querycache('','INSERT INTO TaskApprove (taskid, userid, applevel, date) VALUES (?,?,?, DATE_FORMAT(NOW(), \'%Y-%m-%d %H:%i:%s\'));',[body.id,body.userid,body.applevel])
    ?.then((data)=>{
        if(body.lastapp != 'yes'){
           
            return querycache('','SELECT userid FROM Projectpartcipants WHERE appnum=?',[parseInt(body.applevel +1)]).then((data1)=>{

                let emailarr = []
                data1.forEach(e =>{
                    emailarr.push(e.email) 
                })
              
                transporter.sendMail({
                    from: "stephenrabor@gmail.com",
                   to: emailarr,
                   subject: 'Approve on task '+body.id + " by "+ body.user,
                   text:  body.applevel ==0?"Assigned Task Approved": body.lastapp == 'yes'?"Final Approved":"Approved "+ body.applevel
               }, function(error, info){
                   if (error) {


                   console.log(error );
                   } else {
                   console.log('Email sent: ' + info.response);
                   }
               });
            })
     
        }
 
        if(body.lastapp == 'yes'){
            deleteKeysByPattern('user='+body.userid)
            return querycache('','UPDATE Task set donedate=CURRENT_DATE WHERE id=?',[body.id])
        }
    })
}
const cancelUser = ({request}) =>{
   
    return db.none('UPDATE "Task" set status=2 WHERE id=${id}' ,request.body)
    .then((data) => {
       
        
        // res.redirect("/aasda")
    })
  
}



const viewId = ({query}) =>{
    
    
    return querycache('','SELECT task.name, task.description, task.date, Project.lapprove, Project.projectname, task.projid,Account.email FROM (select name,description,date,projid,userid from task where id=?) as task LEFT JOIN  (select email,id from Account) as Account ON task.userid = Account.id INNER JOIN  (select projectname,lapprove,id from Project) as Project ON task.projid = Project.id',[query.id])?.
    then((data)=>{
        return data[0]
    })
 
}
const taskapprover = ({query}) =>{
    return querycache('','SELECT Account.id, Account.name, Department.departmentname, TaskApprove.date, Role.rolename, TaskApprove.applevel FROM  (select date,applevel,taskid,userid from TaskApprove where taskid= ?) as TaskApprove  LEFT JOIN  (select id,name,roleid,deptid from Account) as Account ON Account.id = TaskApprove.userid LEFT JOIN Department ON Department.id = Account.deptid  LEFT JOIN  Role ON Role.id = Account.roleid ORDER BY  TaskApprove.applevel ASC;',[query.id])
}

const getPrio = ({body}) =>{
    const cachekey ='getPrio:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
   
    if(body.search !=undefined){
        str=" AND (name like '%"+body.search+"%' )"
    }else{
        str=''
    }
    return querycache(cachekey,'SELECT task1.name, task1.description, task1.id FROM (SELECT name, description, id, projid, userid, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM task WHERE donedate is  null and status=3 and userid =? '+str+') AS task1  left JOIN (SELECT projid FROM Projectpartcipants where userid =1) AS Projectpartcipants ON task1.projid = Projectpartcipants.projid WHERE task1.rn<=? ORDER BY task1.rn DESC LIMIT 20;',[body.user,parseInt(((( isNaN(body.page)?1:body.page)) * 20))])

}
const gettotalPrio = ({body}) =>{
    const cachekey ='gettotalPrio:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
  
    if(body.search !='' && body.search!=undefined){
        str=" AND (name like '%"+body.search+"%' )"
    }else{
        str=''
    }
    return querycache(cachekey,' SELECT count(*) as total FROM (SELECT projid FROM task WHERE donedate is  null and status=3 and userid =?'+str+' ) AS task1  LEFT JOIN (SELECT projid FROM  Projectpartcipants where userid =?  ) AS Projectpartcipants  ON task1.projid = Projectpartcipants.projid',[body.user,+body.user])
   ?.then((data)=>{
    return data[0].total
})
}





const getDelay = async ({body}) =>{
    const cachekey ='getDelay:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
   
    if(body.search !=''){
        str=" AND (name like '%"+body.search+"%' )"
    }else{
        str=''
    }
    return querycache(cachekey,'SELECT task1.name, task1.description, task1.id FROM (SELECT name, description, id, projid, userid, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM task WHERE donedate is  null  and date<CURRENT_DATE and userid =? '+str+') AS task1  left JOIN (SELECT projid FROM Projectpartcipants where userid =1) AS Projectpartcipants ON task1.projid = Projectpartcipants.projid WHERE task1.rn<=? ORDER BY task1.rn DESC LIMIT 20;',[body.user,parseInt(((( isNaN(body.page)?1:body.page)) * 20))])
     
}
const gettotaldelay = ({body}) =>{
    const cachekey ='gettotaldelay:user='+body.user+':search:'+body.search+':page='+ (isNaN(body.page)?1:body.page)
    let str =''
  
    if(body.search !='' && body.search!=undefined){
        str=" AND (name like '%"+body.search+"%')"
    }else{
        str=''
    }
    
    return querycache( cachekey,' SELECT count(*) as total FROM (SELECT projid FROM task WHERE donedate is  null  and date<CURRENT_DATE and userid =? '+str+' ) AS task1  LEFT JOIN (SELECT projid FROM  Projectpartcipants where userid =?  ) AS Projectpartcipants  ON task1.projid = Projectpartcipants.projid',[body.user,+body.user])
  ?.then((data)=>{
   
    return data[0].total
})
}


const getAccount = ({body}) =>{
    let str =''
    const cachekey = 'getAccount:search:'+body.search
    if(body.search !=undefined){
        str= " where (Account.name like '%"+body.search+"%' or Account.username like '%"+body.search+"%' or Department.departmentname like '%"+body.search+"%' or Role.rolename like '%"+body.search+"%')"
       
    }else{
        str=''
    }
    return querycache(cachekey,'SELECT * FROM (SELECT  Account.id, username,name, Department.departmentname,Role.rolename, ROW_NUMBER() OVER (ORDER BY Account.id DESC) AS rn FROM  ( SELECT id, deptid, roleid,username, name FROM   Account ) AS Account LEFT JOIN  Department   ON Department.id = Account.deptid LEFT JOIN   Role  ON  Role.id = Account.roleid '+str+') AS taskopt where taskopt.rn>=? limit 20',[parseInt(((( isNaN(body.page)?1:body.page) - 1) * 20)+1)])
}

const gettotalaccount = ({body}) =>{
    let str =''
    const cachekey = 'gettotalaccount:search:'+body.search
    if(body.search !='' && body.search!=undefined){
        str= " where (Account.name like '%"+body.search+"%' or Account.username like '%"+body.search+"%' or Department.departmentname like '%"+body.search+"%' or Role.rolename like '%"+body.search+"%')"
    }else{
        str=''
    }
return querycache(cachekey,'SELECT COUNT(*) AS total FROM ( SELECT id, deptid, roleid FROM Account) AS Account LEFT JOIN Department ON Department.id = Account.deptid LEFT JOIN Role ON Role.id = Account.roleid '+str,[]).then((total) =>{
    return total[0].total
})

}

const getdashboard = ({request}) =>{
    return {name:"test"}

}

const download =  ({query,set}) =>{
   
    if (file_system.existsSync(path.join(__dirname, '..', 'public/task/'+query.id))) {
        var to_zip = file_system.readdirSync(path.join(__dirname, '..', 'public/task/'+query.id+'/'))
        // Directory exists, so you can read its contents
    
        const zp = new admz();
        to_zip.forEach((item,index)=>{
            zp.addLocalFile(path.join(__dirname, '..', 'public/task/'+query.id+'/'+item))
        })
        const file_after_download = 'downloaded_file.zip';
         const data = zp.toBuffer();
         return new Response( data
            , {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition':`attachment; filename=${file_after_download}`,
                    'Content-Length': data.length
                }
            });
      } else {
        console.error('The directory does not exist:', path.join(__dirname, '..', 'public/task/'+query.id));
        return []
      
      }

}

const toexcel = ({query}) =>{
    var str =''
    if(query.status =='delay'){
        str='select name,description,date,donedate from task where donedate is  null and status!=2 and date<CURRENT_DATE'
    }else if (query.status =='done') {
        str='select name,description,date,donedate  from task where donedate is not null'

    }else if (query.status =='priority') {
        str='select name,description,date,donedate  from task where donedate is  null and status=3'
    }else if (query.status =='scheduled') {
        str='select name,description,date,donedate  from task where status=1  AND  donedate is  null and date=CURRENT_DATE'
    }
    
    return querycache('',str,[])?.then((data)=>{
       
        return data
    })
 }
 const approvelevel = ({query}) =>{
    if(query.appnum != 0){
       
        return querycache('','Select * from Projectpartcipants where projid=? and appnum=? and userid=?',[query.id,query.appnum,query.useremail])
    }else{
        return querycache('','Select userid from task where id=?',[query.taskid])
    }
  
}
export{
    viewId,
    updateUser,
    cancelUser,
    download,

    getschedule,
    gettotalschedule,

    getDone,
    gettotaldone,
  
    getPrio,
    gettotalPrio,

    getDelay,
    gettotaldelay,

    getAccount,
    gettotalaccount,

    getdashboard,
    toexcel,
    updateApprove,
    taskapprover,
    approvelevel
}