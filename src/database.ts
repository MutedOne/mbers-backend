import { Elysia,t } from 'elysia'
import {getdashboard,getschedule,gettotalschedule,updateUser,updateApprove,viewId,taskapprover,approvelevel,getDelay,gettotaldelay,getPrio,gettotalPrio,getDone,gettotaldone,getAccount,gettotalaccount,download,toexcel} from './taskcontroller'
import {loginuser,logoutuser} from './logincontroller'
import { topAch,projectStatus,projectView,} from './dashboardcontroller'
import {getcompid} from './companycontroller'
import {addAccount,addUser, addRole, addDept, addproject, allemp, getDepartmentList,getRoleList} from './createcontroller'
import { cors } from '@elysiajs/cors'
import { getProjects,gettotalProjects, allProjects, getProjid, getProjcust, getProjpp} from './projectController'
import { staticPlugin } from '@elysiajs/static'
import fs from 'node:fs'
import path from 'node:path'
import './scheduler'
const app = new Elysia()
	.use(staticPlugin())
	.use(cors())
	.post('/login', loginuser)
	.post('/logout', logoutuser)
	.get('/topAchiever', topAch)
	.get('/projectStatus', projectStatus)
	.post('/viewproj', projectView)
	.get('/dashboard', getdashboard)
	.post('/', getschedule)
	.post('/row', gettotalschedule)
	// .patch('/update', updateUser)
	 .patch('/approve', updateApprove)
	
	 .get('/viewId', viewId)
	 .get('/taskapprover', taskapprover)
	 .get('/approvelevel', approvelevel)
  
	 .post('/listdelay', getDelay)
	 .post('/delayrow', gettotaldelay)
  
	 .post('/listprio', getPrio)
	 .post('/totalprio', gettotalPrio)
  
	 .post('/listdone', getDone)
	 .post('/totaldone', gettotaldone)
  
	 .post('/listemp', getAccount)
	 .post('/totalaccount', gettotalaccount)
	.get('/download', download)
	.get("/downloadExcel", toexcel)

	.post('/add', addUser)
	// .post('/upload',upload.array('file'), uploadthis) 
	.post('/upload', ({ body,query }) => {
	
		if(query.filelength>0){
			fs.mkdir(path.join(__dirname, '..', 'public/task/'+query.lastid+'/'), (err) => {
				if (err) {
					return console.error(err);
				}
				console.log('Directory created successfully!');
			});

			if(query.filelength>1){
				body.file.forEach((file, i) => {
					Bun.write(path.join(__dirname, '..', 'public/task/'+query.lastid+'/'+body.name[i]), file)
				})
			}else{
				Bun.write(path.join(__dirname, '..', 'public/task/'+query.lastid+'/'+body.name), body.file)
			}
		}
		
	
	})

	.post('/addrole', addRole)
	.post('/adddept',addDept)
	.post('/addaccount',addAccount)
	.post('/addproject', addproject)
  
	.get('/departmentlist', getDepartmentList)
	.post('/rolelist', getRoleList)
	.get('/allemp', allemp)

	.post('/listproject', getProjects)
	.get('/viewprojId', getProjid)
	.get('/allproj',allProjects)
	.get('/viewprojcustomer', getProjcust)
	.get('/viewprojapprover', getProjpp)
	// .post('/uploadpro',uploadpro.array('file'), uploadprofile)
	// .post('/uploadpro', uploadprofile)
	.post('/uploadpro', async ({ body: { file },query }) => {
	
		await Bun.write(path.join(__dirname, '..', 'public/account/'+query.id+'.png'), file)
	}, {
		body: t.Object({
			file: t.File()
		})
	})
	
	.post('/totalproject', gettotalProjects)
	.get('/viewempId', getcompid)
	
	.listen(4000)
	 
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)