var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');
var productHelper= require('../helpers/product-helpers')
const userHelper=require('../helpers/user-helpers')
const cartHelper=require('../helpers/cart-helpers')
const orderHelper=require('../helpers/order-helpers')
const wrap=require('../helpers/wrap')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

// ids in the url must be valid ObjectIds, otherwise show 404
router.param('id',(req,res,next,id)=>{
  ObjectId.isValid(id) ? next() : next('route')
})

// logged in user and cart count are shown in the header of every page
router.use(wrap(async(req,res,next)=>{
  res.locals.user=req.session.user
  res.locals.cartCount=req.session.user ? await cartHelper.getCartCount(req.session.user._id) : 0
  next()
}))

/* GET home page. */
router.get('/', wrap(async(req, res)=>{
  const products=await productHelper.getAllProducts()
  res.render('user/view-products',{products})
}));

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
})

router.post('/login',wrap(async(req,res)=>{
  const response=await userHelper.doLogin(req.body)
  if(response.status){
    req.session.loggedIn=true
    req.session.user=response.user
    res.redirect('/')
  }else{
    req.session.loginErr=true
    res.redirect('/login')
  }
}))

router.get('/signup',(req,res)=>{
  if(req.session.loggedIn) return res.redirect('/')
  res.render('user/signup')
})

router.post('/signup',wrap(async(req,res)=>{
  const response=await userHelper.doSignup(req.body)
  if(response.status){
    req.session.loggedIn=true
    req.session.user=response.user
    res.redirect('/')
  }else{
    res.render('user/signup',{signupErr:response.message,username:req.body.username,email:req.body.email})
  }
}))

router.get('/logout',(req,res)=>{
  // keep any admin login in the same browser
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/')
})

router.get('/cart',verifyLogin,wrap(async(req,res)=>{
  const cart=await cartHelper.getCart(req.session.user._id)
  res.render('user/cart',cart)
}))

router.post('/cart/add/:id',verifyLogin,wrap(async(req,res)=>{
  await cartHelper.addToCart(req.session.user._id,req.params.id)
  res.redirect(req.body.redirect==='cart' ? '/cart' : '/')
}))

router.post('/cart/change/:id',verifyLogin,wrap(async(req,res)=>{
  const change=Number(req.body.change)===-1 ? -1 : 1
  await cartHelper.changeQuantity(req.session.user._id,req.params.id,change)
  res.redirect('/cart')
}))

router.post('/cart/remove/:id',verifyLogin,wrap(async(req,res)=>{
  await cartHelper.removeFromCart(req.session.user._id,req.params.id)
  res.redirect('/cart')
}))

router.get('/checkout',verifyLogin,wrap(async(req,res)=>{
  const cart=await cartHelper.getCart(req.session.user._id)
  if(cart.items.length===0) return res.redirect('/cart')
  res.render('user/checkout',cart)
}))

router.post('/checkout',verifyLogin,wrap(async(req,res)=>{
  const cart=await cartHelper.getCart(req.session.user._id)
  if(cart.items.length===0) return res.redirect('/cart')

  const delivery={
    name:String(req.body.name||'').trim(),
    address:String(req.body.address||'').trim(),
    pincode:String(req.body.pincode||'').trim(),
    mobile:String(req.body.mobile||'').trim()
  }
  let error
  if(!delivery.name || !delivery.address) error='Name and address are required'
  else if(!/^\d{6}$/.test(delivery.pincode)) error='Pincode must be 6 digits'
  else if(!/^\d{10}$/.test(delivery.mobile)) error='Mobile number must be 10 digits'
  if(error){
    return res.render('user/checkout',{...cart,delivery,checkoutErr:error})
  }

  const orderId=await orderHelper.placeOrder(req.session.user._id,delivery,cart)
  await cartHelper.clearCart(req.session.user._id)
  res.redirect('/orders/'+orderId+'?placed=1')
}))

router.get('/orders',verifyLogin,wrap(async(req,res)=>{
  const orders=await orderHelper.getUserOrders(req.session.user._id)
  res.render('user/orders',{orders})
}))

router.get('/orders/:id',verifyLogin,wrap(async(req,res,next)=>{
  const order=await orderHelper.getUserOrder(req.session.user._id,req.params.id)
  if(!order) return next()
  res.render('user/order-details',{order,placed:req.query.placed==='1'})
}))

router.post('/orders/:id/cancel',verifyLogin,wrap(async(req,res)=>{
  await orderHelper.cancelOrder(req.session.user._id,req.params.id)
  res.redirect('/orders/'+req.params.id)
}))

module.exports = router;
