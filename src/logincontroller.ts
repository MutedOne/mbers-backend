
import Elysia, { t } from "elysia"
import {querycache} from "./queryconcept"
var jwt = require('jsonwebtoken');

const loginRoute= new Elysia()
.guard({
  body: t.Object({
      username: t.String(),
      password: t.String()
  })
}, app => app
.post('/login',  ({body}) =>{
 
  return querycache('','select id,username,name,status,aa,ea,ma,ua,deptid from account where username=? and password=?',[body.username,body.password])
  ?.then((data)=>{
    querycache( 'loginuser:username:'+body.username,'',[])
    if(data.length>0){
      if(data[0].status == 1){
        var token = jwt.sign(data[0], Bun.env.SESSIONHASH);
        return {token}
      }else{
        return {cstatus:'Account is not active'}
      }
    }else{
      return {cstatus:'No Account'}
    }
  }) 
})
)


export{
  loginRoute
}