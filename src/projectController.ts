const {db} =require('./setup.js')
import { t } from 'elysia'
import path from 'node:path'
import {querycache} from "./queryconcept"
const getProjects = ({body}) =>{
    let str =''
    const cachekey = 'getProjects:search:'+body.search
    if(body.search!=''){
        str=" where  (projectname like '%"+body.search+"%')"
    }else{
        str=''
    }

    return querycache(cachekey,'select * from (SELECT *, ROW_NUMBER() OVER (ORDER BY id DESC) AS rn FROM Project '+str+') as taskopt where taskopt.rn>=? limit 20',[parseInt(((( isNaN(body.page)?1:body.page) - 1) * 20)+1)])
}
const allProjects = () =>{
    
    return querycache('','SELECT * from Project order by id desc',[])
}
const gettotalProjects = ({body}) =>{
    const cachekey = 'gettotalProjects:search:'+body.search
    let str =''

    if(body.search !='' && body.search!=undefined){
        str=" AND (projectname like '%"+body.search+"%' )"
    }else{
        str=''
    }
    return querycache(cachekey,'SELECT count(id) as total from Project '+ str,[])
    .then((done)=>{
        return done[0].total
    })
}
const getProjid = ({query}) =>{
    return querycache('','SELECT * from Project where id=?',[query.id])
}

const getProjcust = ({query}) =>{
    return querycache('','SELECT * from CustomerEmail where proid=?',[query.id])
}
const getProjpp = ({query}) =>{
    return querycache('','select name from ( SELECT * from Projectpartcipants where projid=?) as pp left join Account on pp.userid = Account.id',[query.id])
    
}
export{
    getProjects,
    gettotalProjects,
    allProjects,
    getProjid,
    getProjcust,
    getProjpp
}