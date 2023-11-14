import { Elysia } from 'elysia'
import {loginRoute} from './logincontroller'
import {  userRoute} from './accountcontroller'
import {  classificationRoute} from './classcontroller'
import { eventRoute} from './eventcontroller'
import { environmentRoute} from './environmentcontroller'
import {  actionRoute} from './actioncontroller'
import {  projectRoute} from './projectcontroller'
import {ticketRoute} from './ticketcontroller'
import { deptRoute} from './departmentcontroller'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import './scheduler'
import { helmet } from 'elysia-helmet'


const app = new Elysia()
	.use(helmet({
		contentSecurityPolicy: {
		  directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", 'https://localhost:3000'],
		  },
		},
	  }))
	.use(cors({
		origin: "https://localhost:3000" 
	  }))
	.use(staticPlugin())
	.use(loginRoute)
	.use(userRoute)
	.use(classificationRoute)
	.use(eventRoute)
	.use(environmentRoute)
	.use(actionRoute)
	.use(projectRoute)
	.use(deptRoute)
	.use(ticketRoute)
	.listen(4000)

	 
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)