const {db} =require('./setup.js')
const {transporter} =require('./mailer.js')
var fs = require('fs');
import {deleteKeysByPattern, querycache} from "./queryconcept"
const addUser = ({body}) =>{
    return querycache('',' INSERT INTO task (name,date,status,projid,description,userid) VALUES (?,CURRENT_DATE,?,?,?,?)',[body.name,body.prio,body.proid,body.desc,body.userid])
    ?.then((data)=>{
        console.log(data)
        if(body.prio !=3){
            deleteKeysByPattern('*schedule:user='+body.userid+':*')
        }else{
            deleteKeysByPattern('*Prio:user='+body.userid+':*')
        }
    
        transporter.sendMail({
            from: "deli121kado2023@gmail.com",
           to: String(body.email),
           subject: 'Task',
           text: 'New task created'
         }, function(error, info){
           if (error) {
           console.log(error);
           } else {
           console.log('Email sent: ' + info.response);
           }
       });

       return data
    }).then(async (p)=>{
        const res=await querycache('','SELECT LAST_INSERT_ID() as last_id','')
        return res
       
    })
 
}
const uploadthis = ({set}) =>{
    set.status = 200
    return "file uploaded"
}
const addAccount = ({body}) =>{
    // deleteKeysByPattern('user='+body.userid)
    return querycache('','INSERT INTO Account (username, name,deptid,roleid,password,email) VALUES (?,?,?,?,md5(?),?)',[body.username,body.name,body.deptid,body.roleid,body.password,body.email])
    ?.then((data)=>{
        deleteKeysByPattern('*Account:*')
        transporter.sendMail({
            from: "delikad1o2023@gmail.com",
            to: body.email,
            subject: 'Credentials',
            text: 'Your now have your credentials to login'
          }, function(error, info){
            if (error) {
         
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
         return data
    }) 
}

const addRole = ({body}) =>{
    return querycache('',' INSERT INTO Role (rolename,deptid) VALUES (?,?)',[body.role,body.deptid]).then((data)=>{
        deleteKeysByPattern('*RoleList*')
    })
}

const addDept = ({body}) =>{
    return querycache('',' INSERT INTO Department (departmentname) VALUES (?)',[body.deptname]).then((data)=>{
        deleteKeysByPattern('*Department*')
    })
 }
 const addproject = ({body}) =>{
    return querycache('',' INSERT INTO Project (projectname,summary,lapprove) VALUES (?,?,?);',[body.project,body.summ,body.length])
     ?.then((l)=>{
        deleteKeysByPattern('*Projects:*')
         querycache('','SELECT LAST_INSERT_ID() as id from Project limit 1',[])
         .then((data)=>{
            var str='Insert into Projectpartcipants (projid,appnum,userid) VALUES '
            body.approver.forEach((e)=>{
            
                str+=' ('+data[0].id+','+e.id+','+e.userid+'),'
                console.log(str)
            })
             querycache('',str.substring(0,str.length-1),[])
    
             var str2='Insert into CustomerEmail (proid,email) VALUES '
             console.log(body.clientemail)
             body.clientemail.forEach((e)=>{

                 str2+=' ('+data[0].id+',\''+e+'\'),'
               
             })
          
             querycache('', str2.substring(0,str2.length-1),[])
             return [{last_id:data[0].id}]
        })
     })
}


 const getDepartmentList = () =>{
    const cachekey = 'getDepartmentList:'
    return querycache(cachekey,' SELECT * from Department')
}
const allemp = ({request}) =>{
    const cachekey = 'allemp:'
    return querycache(cachekey,'SELECT id,email from Account')
}
const getRoleList = ({body}) =>{
    // const cachekey = 'getRoleList:'
    return querycache('','SELECT * from Role where deptid='+body.deptId)
}

 export{
    addAccount,
    addUser,
    addRole,
    addDept,
    addproject,
    allemp,

    getDepartmentList,
    getRoleList,
    uploadthis
 }