const express = require('express');


const { Article, User } = require("../models/article");

const router=express.Router();


router.get("/new",(req,res)=>{
    res.render("articles/new",{article:new Article()});
});

router.get("/edit/:id",async (req,res)=>{
    const article=await Article.findById(req.params.id);
    res.render("articles/edit",{article:article});
} );

router.get("/:id",async (req,res)=>{
    const article=await Article.findById(req.params.id);
    if(article==null) res.redirect("/");
    res.render("articles/show",{article:article});
}
);



router.post("/",async (req,res)=>{
    let article= new Article({
        company_name:req.body.company_name,
        job_role:req.body.job_role,
        candidate_name:req.body.candidate_name,
        email:req.body.email,
        strategy:req.body.strategy,
        journey:req.body.journey,

        
    })
    try{
       article =await article.save();
       res.redirect(`/articles/${article.id}`);

    }catch(e){
        res.render("articles/new",{article:article});
    }
     



        
}
);




router.patch("/:id", async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.redirect(`/articles/${updatedArticle.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



router.delete("/:id", async (req, res) => {
    try {
      await Article.findByIdAndDelete(req.params.id);
      res.redirect('/login/my-articles');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });



module.exports=router;