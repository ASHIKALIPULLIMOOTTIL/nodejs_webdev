const express=require('express')
const path=require('path')

const app=express()

app.use(function(req,res,next){
    console.log('start')   //middleware
    next()
})

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'singup.html'))
    console.log('middle')
    //next()
})
/*
app.use(function(req,res){
    console.log('end')   //middleware
    
})
*/
app.post('/signup',function(req,res){
    res.send('account created')
    
})

app.get('/about',(req,res)=> res.send('this is about page'))

app.listen(3000,function(){
    console.log('server running')
})