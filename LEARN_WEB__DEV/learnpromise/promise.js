/*
function add(num1,num2,callback){
    let err=false
    if(num1==0){
        err=true
    }
    callback(num1+num2,err)
}
function mult(num1,num2,callback){
    callback(num1*num2)
}
function div(n1,n2,callback){
    callback(n1/n2)
}
add (10,20,(sum,err)=>{
    if(err)
        console.log('error')
    else
        console.log(sum)
         mult(sum,sum,(prd)=>{
            console.log(prd)
            div(prd,10,(result)=>{
                console.log(result)
            })
         })
})
*/
/*
///promise
const promise=require('promise')

function add(num1,num2){
    return new promise((resolve,reject)=>{
        if(num1==0){
            reject("error")
        }
        resolve(num1+num2)
    })
}

function Mult(num1,num2){
    return new promise((resolve,reject)=>{
        if(num1==0){
            reject("error")
        }
        resolve(num1*num2)
    })
}

function div(num1,num2){
    return new promise((resolve,reject)=>{
        if(num1==0){
            reject("error")
        }
        resolve(num1/num2)
    })
}
add(20,30).then((sum)=>{
    console.log(sum)
    return Mult(sum,sum)
}).then((prd)=>{
    console.log(prd)
    return div(prd,10)
}).then((result)=>{
    console.log(result)
}).catch((err)=>{
    console.log(err)
})*/

//async,await

const {resolve,reject} = require('promise')

function getName(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('ashik')
        },3000)
    })
}

function getMobile(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('9037377801')
        },2000)
    })
}

// Promise.all([getName(),getMobile()]).then((result)=>{   //give the o/p at once
//     console.log(result)
// })

async function getUser(){
    let name =await getName()   //if u no call await it will not wait 3s to get the name
    console.log(name)

    let ph =await getMobile()   //if u no call await it will not wait 2s to get the ph ie:total 5s
    console.log(ph)
}

getUser()

