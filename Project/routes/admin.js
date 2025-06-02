var express = require('express');
var router = express.Router();
var productHelper= require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  let products=[
    {
      name:"vegetables",
      category:"grocery",
      description:"good quality",
      images:"https://static.vecteezy.com/system/resources/thumbnails/047/830/714/small/a-vibrant-assortment-of-fresh-vegetables-including-peppers-onions-lettuce-broccoli-tomatoes-corn-and-garlic-arranged-on-a-white-background-png.png"
    },
    {
      name:"fish",
      category:"nonveg",
      description:"good quality",
      images:"https://static.vecteezy.com/system/resources/thumbnails/047/830/714/small/a-vibrant-assortment-of-fresh-vegetables-including-peppers-onions-lettuce-broccoli-tomatoes-corn-and-garlic-arranged-on-a-white-background-png.png"
    },
    {
      name:"chicken",
      category:"nonveg",
      description:"good quality",
      images:"https://static.vecteezy.com/system/resources/thumbnails/047/830/714/small/a-vibrant-assortment-of-fresh-vegetables-including-peppers-onions-lettuce-broccoli-tomatoes-corn-and-garlic-arranged-on-a-white-background-png.png"
    },
    {
      name:"fruits",
      category:"grocery",
      description:"good quality",
      images:"https://static.vecteezy.com/system/resources/thumbnails/047/830/714/small/a-vibrant-assortment-of-fresh-vegetables-including-peppers-onions-lettuce-broccoli-tomatoes-corn-and-garlic-arranged-on-a-white-background-png.png"
    }
  ]
  res.render('admin/view-products',{admin:true,products})
});

router.get('/add-product',function(req,res){
  res.render('admin/add-product')
})

router.post('/add-product',(req,res)=>{
  console.log(req.body);
  console.log(req.files.Image);
  productHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }
    })
    
  })
})
module.exports = router;
