const {db} =require('./setup.js')
import {querycache} from "./queryconcept"
const getcompid = ({query}) =>{

    return querycache('','SELECT * from Account where id=?' ,[query.id])
    ?.then((data)=>{
        return data[0]
    })

}
export{
    getcompid
}