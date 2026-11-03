var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
const { ObjectId } = require('mongodb');
var productHelper= require('../helpers/product-helpers')
const userHelper=require('../helpers/user-helpers')
const orderHelper=require('../helpers/order-helpers')
const wrap=require('../helpers/wrap')

const ADMIN_EMAIL=process.env.ADMIN_EMAIL||'admin@shop.com'
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'admin123'
const IMAGE_DIR=path.join(__dirname,'../public/product-images')

router.use((req,res,next)=>{
  res.locals.admin=true
  res.locals.adminLoggedIn=req.session.adminLoggedIn
  next()
})

const verifyAdmin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

router.param('id',(req,res,next,id)=>{
  ObjectId.isValid(id) ? next() : next('route')
})

// form values -> product document, or an error message
const readProductForm=(body)=>{
  const product={
    Name:String(body.Name||'').trim(),
    Category:String(body.Category||'').trim(),
    Price:Number(body.Price),
    Description:String(body.Description||'').trim()
  }
  if(!product.Name) return {product,error:'Name is required'}
  if(body.Price==='' || !Number.isFinite(product.Price) || product.Price<0) return {product,error:'Price must be a positive number'}
  return {product}
}

const uploadedImage=(req)=>{
  const image=req.files && req.files.Image
  if(!image) return null
  if(!image.mimetype.startsWith('image/')) throw new Error('Only image files can be uploaded')
  return image
}

router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn) return res.redirect('/admin')
  res.render('admin/login')
})

router.post('/login',(req,res)=>{
  if(req.body.email===ADMIN_EMAIL && req.body.password===ADMIN_PASSWORD){
    req.session.adminLoggedIn=true
    res.redirect('/admin')
  }else{
    res.render('admin/login',{loginErr:true,email:req.body.email})
  }
})

router.get('/logout',(req,res)=>{
  delete req.session.adminLoggedIn
  res.redirect('/admin/login')
})

router.use(verifyAdmin)

/* GET users listing. */
router.get('/', wrap(async(req, res)=>{
  const products=await productHelper.getAllProducts()
  res.render('admin/view-products',{products})
}));

router.get('/add-product',function(req,res){
  res.render('admin/add-product')
})

router.post('/add-product',wrap(async(req,res)=>{
  const {product,error}=readProductForm(req.body)
  let image
  try{
    image=uploadedImage(req)
  }catch(err){
    return res.render('admin/add-product',{product,error:err.message})
  }
  if(error || !image){
    return res.render('admin/add-product',{product,error:error||'Image is required'})
  }
  const id=await productHelper.addProduct(product)
  await image.mv(path.join(IMAGE_DIR,id+'.jpg'))
  res.redirect('/admin')
}))

router.get('/edit-product/:id',wrap(async(req,res,next)=>{
  const product=await productHelper.getProduct(req.params.id)
  if(!product) return next()
  res.render('admin/edit-product',{product})
}))

router.post('/edit-product/:id',wrap(async(req,res)=>{
  const {product,error}=readProductForm(req.body)
  product._id=req.params.id
  let image
  try{
    image=uploadedImage(req)
  }catch(err){
    return res.render('admin/edit-product',{product,error:err.message})
  }
  if(error){
    return res.render('admin/edit-product',{product,error})
  }
  delete product._id
  await productHelper.updateProduct(req.params.id,product)
  if(image){
    await image.mv(path.join(IMAGE_DIR,req.params.id+'.jpg'))
  }
  res.redirect('/admin')
}))

router.post('/delete-product/:id',wrap(async(req,res)=>{
  await productHelper.deleteProduct(req.params.id)
  fs.unlink(path.join(IMAGE_DIR,req.params.id+'.jpg'),()=>{})
  res.redirect('/admin')
}))

router.get('/orders',wrap(async(req,res)=>{
  const orders=await orderHelper.getAllOrders()
  res.render('admin/orders',{orders,statuses:orderHelper.STATUSES})
}))

router.post('/orders/:id/status',wrap(async(req,res)=>{
  await orderHelper.updateStatus(req.params.id,req.body.status)
  res.redirect('/admin/orders')
}))

router.get('/users',wrap(async(req,res)=>{
  const users=await userHelper.getAllUsers()
  res.render('admin/users',{users})
}))

module.exports = router;
