const express = require('express');


const { Article, User } = require("../models/article");

const router=express.Router();


router.get("/new",(req,res)=>{
    res.render("articles/new",{article:new Article()});
});

router.get("/edit/:id",async (req,res)=>{
    const article=await Article.findById(req.params.id);
    res.render("articles/edit",{article:article});
});

router.get("/:id",async (req,res)=>{
    const article=await Article.findById(req.params.id);
    if(article==null) res.redirect("/");
    res.render("articles/show",{article:article});
});

router.get("/show/:id",async (req,res)=>{
  const article=await Article.findById(req.params.id);
  if(article==null) res.redirect("/");
  res.render("articles/show1",{article:article});
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
      res.redirect('/my-articles');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });



module.exports=router;