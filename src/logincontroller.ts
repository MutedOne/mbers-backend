const {db} =require('./setup.js')
import {querycache} from "./queryconcept"
const loginuser =   ({body}) =>{
  console.log("yow")
  return querycache('','SELECT  Account.id,Account.deptid,Account.roleid,Account.email,name,Department.departmentname,Role.rolename FROM ( SELECT id,deptid,roleid,name,email from Account  where username=?  AND password=? ) as Account left join Department ON Department.id = Account.deptid left join Role ON Role.id = Account.roleid',[body.username,body.password])
  ?.then((data)=>{
    console.log(data)
    return data[0]
  }) 
}

const logoutuser =   ({body}) =>{
  return querycache('')
  
}
export{
    loginuser,
    logoutuser
}