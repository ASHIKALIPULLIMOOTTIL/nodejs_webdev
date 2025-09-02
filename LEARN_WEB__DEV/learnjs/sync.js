/*var dt=new Date()
for(i=0;i<12;i++){
    console.log("hi")
}
var diff=new Date()-dt
console.log(diff)*/

//synchronous
function longTask(Tasktime){
    dt=new Date()
    while((new Date()-dt) <= Tasktime){
        
    }
}
console.log('started')
longTask(2000)
console.log('end')

console.log('started')
longTask(4000)
console.log('end')
/*
//asynchronous
function showEnd(){
    console.log('end')
}

console.log('started')
setTimeout(showEnd,2000)

console.log('started')
setTimeout(showEnd,2000)

console.log('started')
setTimeout(showEnd,2000)
*/