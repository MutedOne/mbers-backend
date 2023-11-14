
import Elysia, { t } from "elysia";
import { transporter } from "./mailer";
import {deleteKeysByPattern, querycache,exportCache} from "./queryconcept"
const formatter = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Manila'});
const ticketRoute = new Elysia()
.guard({
  body:t.Optional(t.Object({
    page:t.Optional(t.Any()||t.Number()),
    id:t.Optional( t.Number()),
    search:t.Optional(t.String()),
    code:t.Optional( t.String()),
    ttype:t.Optional( t.String()),
    name:t.Optional( t.String()),
    deptid:t.Optional( t.Number()),
    dept:t.Optional( t.String()),
    key:t.Optional( t.Any()),
    idquery:t.Optional(t.Object({
      id:t.Optional( t.Number()),
      proid:t.Optional( t.Number()),
      proId:t.Optional( t.Number()),
      pproid:t.Optional( t.String()),
      ticketno:t.Optional( t.String()),
      date:t.Optional( t.String()),
      envid:t.Optional( t.Number()),
      eventid:t.Optional( t.Number()),
      envId:t.Optional( t.Number()),
      eventId:t.Optional( t.Number()),
      eenvid:t.Optional( t.String()),
      eeventid:t.Optional( t.String()),
      rp:t.Optional( t.String()),
      module:t.Optional( t.String()),
      app:t.Optional( t.String()),
      classid:t.Optional( t.Number()),
      classId:t.Optional( t.Number()),
      cclassid:t.Optional( t.String()),
      issue:t.Optional( t.String()),
      note:t.Optional( t.String()),
      status:t.Optional( t.String()),
      devstat:t.Optional( t.String()),
      devcharge:t.Optional( t.String()),
      timeline:t.Optional( t.String()),
      devact:t.Optional( t.String()),
      devnotes:t.Optional( t.String()),
      dateend:t.Optional( t.String()),
      datecomp:t.Optional( t.String()),
      qaname:t.Optional( t.String()),
      devname:t.Optional( t.String()),
      appseq:t.Optional(t.Object( { 
        dept: t.Optional( t.Any()),
        name: t.Optional( t.Any()),
        ddept:t.Optional( t.Any()),
        nname:t.Optional( t.Any()) ,
        action:t.Optional( t.Any()),
        note:t.Optional( t.Any()),
        status:t.Optional( t.Any()),
        date:t.Optional( t.Any()),
        depthead:t.Optional( t.Any()),
      }))
    }))
   

  })),
  query:t.Optional(t.Object({
    proid:t.Optional( t.String()),
    proId:t.Optional( t.Number()),
    pproid:t.Optional( t.Number()),
    ticketno:t.Optional( t.String()),
    date:t.Optional( t.String()),
    envid:t.Optional( t.String()),
    eventid:t.Optional( t.String()),
    envId:t.Optional( t.String()),
    eventId:t.Optional( t.String()),
    eenvid:t.Optional( t.String()),
    eeventid:t.Optional( t.String()),
    rp:t.Optional( t.String()),
    module:t.Optional( t.String()),
    app:t.Optional( t.String()),
    classId:t.Optional( t.String()),
    classid:t.Optional( t.String()),
    cclassid:t.Optional( t.String()),
    issue:t.Optional( t.String()),
    note:t.Optional( t.String()),
    status:t.Optional( t.String()),
    devstat:t.Optional( t.String()),
    devcharge:t.Optional( t.String()),
    timeline:t.Optional( t.String()),
    devact:t.Optional( t.String()),
    devnotes:t.Optional( t.String()),
    dateend:t.Optional( t.String()),
    datecomp:t.Optional( t.String()),
    qaname:t.Optional( t.String()),
    devname:t.Optional( t.String()),
    id:t.Optional( t.Number()),
    appseq:t.Optional(t.Object( { 
      dept: t.Optional( t.Any()),
      name: t.Optional( t.Any()),
      ddept:t.Optional( t.Any()),
      nname:t.Optional( t.Any()) ,
      action:t.Optional( t.Any()),
      note:t.Optional( t.Any()),
      status:t.Optional( t.Any()),
      date:t.Optional( t.String()),
      depthead:t.Optional( t.Any()),
    }))

  }))  
}, app => app
.post('/ticket',  ({body,query}) =>{
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
  let str ='where datecomplete  is  null '

  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicket:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes+':page='+ (isNaN(body.page)?1:body.page)
    str +="and ticketno like '%"+query.ticketno+"%' "
    if(query.proid!="0"){
     str += " and proid = "+query.proid
    }
    if(query.date!= ''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicket:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes+':page='+ (isNaN(body.page)?1:body.page)
  }

 return querycache(cachekey,  'select rn,ticket.id,code as proid,ticketno,date,issue,status from (select id,proid,ticketno,date,issue,status,datecomplete,row_number() over( order by id desc) as rn from  ticket '+str+') as ticket left join (select id,code from project) as project on ticket.proid = project.id WHERE  rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/tickettotal', ({body,query,request}) =>{
  
  let cachekey =''
  let str ='where datecomplete  is  null '
  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicketTotal:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
    str += " and ticketno like '%"+query.ticketno+"%' "
    if(query.proid!="0"){
      str += " and proid = "+query.proid
    }
    if(query.date!=''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicketTotal:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
  }
  return querycache(cachekey,  ' select count(ticket.id) as total from (select id,proid,datecomplete from ticket '+str+') as ticket left join (select id,code from project) as project on ticket.proid = project.id ',[]).then((data)=>{
   
    return data[0].total
  })
})
.get('/printTicket', ({body,query})=>{
  let cachekey =''
  let str ='where datecomplete  is  null '

  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicketPrint:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
    str += "and ticketno like '%"+query.ticketno+"%'"
    if(query.proid!="0"){
      str += " and proid = "+query.proid
    }
    if(query.date!=''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicketPrint:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
  }
  return querycache(cachekey,  'Select proid,ticketno,date,issue,status from ticket '+str+' order by id desc',[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getTicketPrintData:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date +':issue'+query.issue +':status'+query.status,dataarr)
  })
})
.post('/ticketdone', ({body,query}) =>{
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
  let str ='where datecomplete  is not null '

  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicketDone:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes+':page='+ (isNaN(body.page)?1:body.page)
    str += " and ticketno like '%"+query.ticketno+"%' "
    if(query.proid!="0"){
     str += " and proid = "+query.proid
    }
    if(query.date!=''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicketDone:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes+':page='+ (isNaN(body.page)?1:body.page)
  }

 return querycache(cachekey,  'select rn,ticket.id,code as proid,ticketno,date,issue,status from (select id,proid,ticketno,date,issue,status,datecomplete,row_number() over( order by id desc) as rn from  ticket '+str+') as ticket left join (select id,code from project) as project on ticket.proid = project.id WHERE  rn>=? and rn<=?  ORDER BY rn  ',[startItem,endItem])
  
})
.post('/tickettotaldone', ({body,query}) =>{

  let cachekey =''
  let str ='where datecomplete  is not null '
  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicketDoneTotal:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
    str += "and ticketno like '%"+query.ticketno+"%' "
    if(query.proid!="0"){
      str += " and proid = "+query.proid
    }
    if(query.date!=''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicketDoneTotal:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
  }
  return querycache(cachekey,  ' select count(ticket.id) as total from (select id,proid,datecomplete from ticket '+str+') as ticket left join (select id,code from project) as project on ticket.proid = project.id ',[]).then((data)=>{
   
    return data[0].total
  })
})
.get('/printTicketdone', ({body,query})=>{
  let cachekey =''
  let str ='where datecomplete  is not null '

  if(query.ticketno!=undefined||query.proid!=undefined||query.date!=undefined
    ||query.envId!=undefined||query.eventId!=undefined||query.rp!=undefined
    ||query.module!=undefined||query.app!=undefined||query.classId!=undefined
    ||query.issue!=undefined||query.note!=undefined||query.status!=undefined
    ||query.devstat!=undefined||query.devcharge!=undefined||query.timeline!=undefined
    ||query.devact!=undefined||query.devnotes!=undefined){
    cachekey ='getTicketPrint:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
    str += "and ticketno like '%"+query.ticketno+"%' " 
    if(query.proid!="0"){
      str += " and proid = "+query.proid
    }
    if(query.date!=''){
     str += " and date like '%"+query.date+"%'"
    }
    if(query.envId!="0"){
      str += " and envId like '%"+query.envId+"%'"
     }
     if(query.eventId!="0"){
      str += " and eventId like '%"+query.eventId+"%'"
     }
     if(query.rp!=''){
      str += " and rp like '%"+query.rp+"%'"
     }
     if(query.module!=''){
      str += " and module like '%"+query.module+"%'"
     }
     if(query.app!=''){
      str += " and app like '%"+query.app+"%'"
     }
     if(query.classId!="0"){
      str += " and classId like '%"+query.classId+"%'"
     }
     if(query.issue!=''){
      str += " and issue like '%"+query.issue+"%'"
     }
     if(query.note!=''){
      str += " and note like '%"+query.note+"%'"
     }
     if(query.status!=''){
      str += " and status like '%"+query.status+"%'"
     }
     if(query.devstat!=''){
      str += " and devstat like '%"+query.devstat+"%'"
     }
     if(query.devcharge!=''){
      str += " and devcharge like '%"+query.devcharge+"%'"
     }
     if(query.timeline!=''){
      str += " and timeline like '%"+query.timeline+"%'"
     }
     if(query.devact!=''){
      str += " and devact like '%"+query.devact+"%'"
     }
     if(query.devnotes!=''){
      str += " and devnotes like '%"+query.devnotes+"%'"
     }
  }else{
    cachekey ='getTicketDonePrint:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date+':envId:'+query.envId+':eventId'+query.eventId+':rp'+query.rp+
    ':module'+query.module+':app'+query.app+':classId'+query.classId+':issue'+query.issue+':note'+query.note+':status'+query.status+
    ':devstat'+query.devstat+':devcharge'+query.devcharge +':timeline'+query.timeline +':devact'+query.devact+
    ':devnotes'+query.devnotes
  }
  return querycache(cachekey,  'Select proid,ticketno,date,issue,status from ticket '+str+' order by id desc',[]).then((data)=>{
    let dataarr:any=[]
    data.forEach((a:any )=>  dataarr.push(Object.values(a)) )
    return exportCache('getTicketDonePrintData:ticketno:'+query.ticketno+':proid:'+query.proid +':date'+query.date +':issue'+query.issue +':status'+query.status,dataarr)
  })
})
.post('/getIdTicket', ({body})=>{
  return querycache('getTicketId:id:'+body.id,  ' select id,ticketno,date,dateend,envid,eventid,rp,module,app,proid,classid,issue,(select code from project where id=proid) as pproid,(select ttype from environment where id=envid) as eenvid,(select ttype from eventmaster where id=eventid) as eeventid,(select code from classification where id=classid) as cclassid from ticket where id=?',[body.id])
 
})
.post('/getIdTicketHead', ({body})=>{
  return querycache('getIdTicketHead:id:'+body.id,  'select ifnull(group_concat( account.name),\'\')   as name from (select userid,id from ticketApp where ticketid=? and date is not null) as ticketApp left join deptTeam on ticketApp.userid  = deptTeam.deptmemberid left join (select id,name from account) as account on deptTeam.depthead=account.id  group by ticketApp.id,ticketApp.userid ',[body.id])
 
})
.post('/createTicket', ({body})=>{
  deleteKeysByPattern('*getTicketTotal*')
  deleteKeysByPattern('*getTicket:*')
  deleteKeysByPattern('*getTicketPrint*')
  
  return querycache('',' INSERT INTO ticket (proid,date,envid,eventid,rp,module,app,classid,issue,dateend) VALUES ( ?,CURRENT_DATE(),?,?,?,?,?,?,?,?)',[body.idquery?.proid,body.idquery?.envid,body.idquery?.eventid,body.idquery?.rp,body.idquery?.module,body.idquery?.app,body.idquery?.classid,body.idquery?.issue,body.idquery?.dateend])
  .then((data)=>{
    return querycache('','SELECT LAST_INSERT_ID() as lastid;',[])
  }).then((val)=>{
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // Get the current year (4 digits)
    const currentMonth = currentDate.getMonth() + 1; // Get the current month (0-11, so add 1)
    const currentDay = currentDate.getDate(); // Get the current day of the month (1-31)
    const formattedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
     querycache('', 'UPDATE ticket SET ticketno = ? WHERE id=?;',[formattedDate+val[0].lastid,val[0].lastid])
    
     body.idquery?.appseq?.dept.forEach((z:any,index:any)=>{
      querycache('', 'insert into ticketApp (ticketid,deptid,userid) VALUES (?,?,?) ',[val[0].lastid,z, body.idquery?.appseq?.name[index]])
     })
    return val[0].lastid
  })
})
.post('/updateTicket', ({body})=>{
  deleteKeysByPattern('*getTicketId:id:'+body.idquery?.id)
  deleteKeysByPattern('*getTicket:*')
  deleteKeysByPattern('*getTicketPrint*')
  deleteKeysByPattern('*getIdTicketApp:id:'+body.idquery?.id)

  querycache('',' DELETE FROM ticketApp WHERE ticketid=?;',[body.idquery?.id]).then(()=>{
    body.idquery?.appseq?.dept.forEach((z:any,index:any)=>{
      querycache('', 'insert into ticketApp (ticketid,deptid,userid,note,action,status) VALUES (?,?,?,?,?,?) ',[body.idquery?.id,z, body.idquery?.appseq?.name[index], body.idquery?.appseq?.action[index], body.idquery?.appseq?.note[index], body.idquery?.appseq?.status[index]])
     })
  })
  return querycache('',  'UPDATE ticket SET proid=?,ticketno=?,envId=?,eventId=?,rp=?,module=?,app=?,classId=?,issue=?,dateend=? WHERE id=?;',[body.idquery?.proid,body.idquery?.ticketno,body.idquery?.envid,body.idquery?.eventid,body.idquery?.rp,body.idquery?.module,body.idquery?.app,body.idquery?.classid,body.idquery?.issue,body.idquery?.dateend,body.idquery?.id])

})
.post('/deleteTicket', ({body})=>{
  deleteKeysByPattern('*getTicketId:id:'+body.id)
  deleteKeysByPattern('*getTicket:*')
  deleteKeysByPattern('*getTicketTotal*')
  deleteKeysByPattern('*getTicketPrint*')
  return querycache('',  ' DELETE FROM ticket WHERE id=?;',[body.id])
})
.post('/allproid', ({body})=>{
  return querycache('getTicketproid:code:'+body.code,"select id,code from project where code like '%"+body.code+"%' limit 5",[])
})
.post('/allenvid', ({body})=>{
  return querycache('getTicketenvid:ttype:'+body.ttype,  "select id,ttype from environment where ttype like '%"+body.ttype+"%' limit 5",[])
})
.post('/alleventid', ({body})=>{
  return querycache('getTicketeventid:ttype:'+body.ttype,  "select id,ttype from eventmaster where ttype like '%"+body.ttype+"%' limit 5",[])
})
.post('/allclassid', ({body})=>{
  return querycache('getTicketclassid:code:'+body.code,  "select id,code from classification where code like '%"+body.code+"%' limit 5",[])
})
.post('/alluseridticket', ({body})=>{
  return querycache('getTicketuserid:name:'+body.name+':deptid:'+body.deptid,  "select id,name from account where name like '%"+body.name+"%' and deptid =? limit 5",[body.deptid])
})
.post('/alldeptid', ({body})=>{
  return querycache('getTicketdeptid:dept:'+body.dept,  "select id,dept from department where dept like '%"+body.dept+"%' limit 5",[])
})
.post('/getIdTicketApp', ({body})=>{
  return querycache('getIdTicketApp:id:'+body.id,  ' select concat(\'[\', group_concat(ticketApp.deptid),\']\') as deptid,concat(\'[\',group_concat(concat(\'"\',ticketApp.note,\'"\') ),\']\')  as note ,concat(\'[\', group_concat(ticketApp.status),\']\') as status, concat(\'[\',group_concat(concat(\'"\',ticketApp.action,\'"\') ),\']\')  as action ,concat(\'[\',group_concat(ticketApp.userid),\']\')  as userid ,concat(\'[\',group_concat(concat(\'"\',department.dept,\'"\') ),\']\')  as ddeptid ,concat(\'[\',group_concat(concat(\'"\', account.name,\'"\')),\']\')  as uuserid ,concat(\'[\',group_concat(concat(\'"\', ticketApp.date,\'"\')),\']\')  as date  from (select deptid,userid,ticketid,action,status,note,date from ticketApp where ticketid=?) as ticketApp left join department on ticketApp.deptid = department.id left join (select id,name from account) as account on account.id = ticketApp.userid group by ticketApp.ticketid',[body.id])
 
})
.post('/getIdTicketApprove', ({body})=>{
  deleteKeysByPattern('getIdTicketApp:id:'+body.idquery?.id)
  if(body.idquery?.appseq?.dept.length == body.key+1){
    deleteKeysByPattern('*getTicketTotal*')
    deleteKeysByPattern('*getTicket:*')
    deleteKeysByPattern('*getTicketPrint*')
    querycache('','UPDATE ticket SET datecomplete=current_date() WHERE id=?',[body.idquery?.id])
    querycache('','select group_concat(account.email ) as email from (select userid from ticketApp where userid=?) as ticketApp left join deptTeam on ticketApp.userid = deptTeam.deptmemberid left join (select email,id from account) as account on account.id = deptTeam.depthead',[body.idquery?.appseq?.name[body.key]]).then((data=>{
      transporter.sendMail({
        from: "stephenrabor@gmail.com",
        to: data[0].email,
        subject: 'Completed on this task ticketno:'+body.idquery?.ticketno,
        text:  'try'
         }, function(error:any, info:any){
           if (error) {
     
     
           console.log(error );
           } else {
           console.log('Email sent: ' + info.response);
           }
         });
    }))
  }else{
    querycache('','select group_concat(account.email ) as email from (select userid from ticketApp where userid=?) as ticketApp left join deptTeam on ticketApp.userid = deptTeam.deptmemberid left join (select email,id from account) as account on account.id = deptTeam.depthead',[body.idquery?.appseq?.name[body.key]]).then((data=>{
      transporter.sendMail({
        from: "stephenrabor@gmail.com",
        to: data[0].email,
        subject: 'Approve on task this ticketno:'+body.idquery?.ticketno,
        text:  'try'
         }, function(error:any, info:any){
           if (error) {
     
     
           console.log(error );
           } else {
           console.log('Email sent: ' + info.response);
           }
         });
    }))

  }


  return querycache('',  ' UPDATE ticketApp SET note=?,status=?,action=?,date=current_date() WHERE ticketid=? and userid=? and deptid=?;',[body.idquery?.appseq?.note[body.key],body.idquery?.appseq?.status[body.key],body.idquery?.appseq?.action[body.key],body.idquery?.id,body.idquery?.appseq?.name[body.key],body.idquery?.appseq?.dept[body.key]])
}))
export{
  ticketRoute
}