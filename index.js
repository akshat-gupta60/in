const express=require("express");
const app=express();
const articleRouter=require("./routes/articles");
const mongoose=require("mongoose");
const { Article, User } = require("./models/article");
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();
const PORT=process.env.PORT || 5000;

const methodOverride=require("method-override");

const connectionString =


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

app.set('view engine', 'ejs');
const path=require("path");
console.log(path.join(__dirname,'/views'));
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'partials'));
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'your-secret-key', // Replace with your own secret key
  resave: false,
  saveUninitialized: true
}));




function authenticateUser(req, res, next) {
  if (req.session.userEmail) {
    next();
  } else {
    res.redirect('/login');
  }
}


app.get('/',async (req,res)=>{
   const articles= await Article.find().sort({createdAt:'desc'});

    res.render('articles/index',{article:articles});
}
);


app.get("/register",(req,res)=>{
    res.render("articles/registration");
});


app.get("/login",(req,res)=>{
    res.render("articles/login");
}
);

app.post("/register", async (req, res) => {
    try {
      if (
        req.body.name == "" ||
        req.body.email == "" ||
        req.body.phone == "" ||
        req.body.password == "" ||
        req.body.confpass == ""
      ) {
        res.render("articles/message");
        return;
      }
  
      const email = req.body.email;
      const useremail = await User.findOne({ email: email });
      if (useremail) {
        res.render("articles/message2");
        return;
      }
      
      const password = req.body.password;
      const cpassword = req.body.confpass;
      if (password == cpassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const registerEmployee = new User({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hashedPassword,
          confirmpassword: hashedPassword,
        });
        //hash the password

        // const token=await registerEmployee.generateAuthToken();
        // console.log(token);



        // //cookie generate
        // res.cookie("jwt",token,{
        //   expires:new Date(Date.now()+30000),
        //   httpOnly:true
        // });


        const registered = await registerEmployee.save();
        res.render("articles/login");
        
      } else {
        res.render("articles/new");
        return;
      }
  
      console.log(req.body.name);
    } catch (e) {
      res.send(e);
    }
  });


//   app.post("/login",async(req,res)=>{
//     try{
//         const email=req.body.email;
//         const password=req.body.password;
//         const useremail=await User.findOne({email:email});
//         //const isMatch=await bcrypt.compare(password,useremail.password);

//         // const token=await useremail.generateAuthToken();
//         // console.log(token);

//         // res.cookie("jwt",token,{
//         //   expires:new Date(Date.now()+50000),
//         //   httpOnly:true,
          

//         // });
//         // console.log();


         
//         if(useremail.password==password){
//           req.session.userEmail = user.email; // Store the user's email in the session
          
//             const articles= await Article.find().sort({createdAt:'desc'});

//     res.render('articles/index1',{article:articles});
           
//         }else{
//             res.send("invalid login details");
//         }
//     }catch(e){
//         res.status(400).send("invalid login details");
//     }
// }
// );

  
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const useremail = await User.findOne({ email: email });

    if (useremail) {
      const passwordMatch = await bcrypt.compare(password, useremail.password);
      if (passwordMatch) {
      req.session.userEmail = useremail.email; // Store the user's email in the session
      const articles = await Article.find().sort({ createdAt: 'desc' });
      res.redirect('login/all-articles');
      }
      else {
        res.send("Invalid login details");
      }
     

    } else {
      res.send("Invalid login details");
    }
  }
   catch (e) {
    res.status(400).send("Invalid login details");
  }
});


app.get('/login/all-articles', authenticateUser,async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    res.render('articles/index1.ejs', { articles : articles});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/login/my-articles', authenticateUser, async (req, res) => {
  // if (!req.session.userEmail) {
  //   res.redirect('/login');
  //   return;
  // }

  try {
     userEmail = req.session.userEmail;
    const articles = await Article.find({ email: userEmail }).sort({ createdAt: 'desc' });
    res.render('articles/myarticles', { articles: articles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/'); // Redirect the user to the login page after logout
  });
});

app.get('/articles/edit/:id', authenticateUser, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { article: article });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Handle search request
app.get('/login/search', (req, res) => {
  const searchQuery = req.query.query;

  // Fetch articles from the database based on the search query
  Article.find({ company_name: { $regex: searchQuery, $options: 'i' } })
      .then(articles => {
          res.render('articles/search', { articles });
      })
      .catch(error => {
          console.log('Error:', error);
          res.status(500).json({ error: 'An error occurred while fetching the search results' });
      });
});

app.get('/search', (req, res) => {
  const searchQuery = req.query.query;

  // Fetch articles from the database based on the search query
  Article.find({ company_name: { $regex: searchQuery, $options: 'i' } })
      .then(articles => {
          res.render('articles/search', { articles });
      })
      .catch(error => {
          console.log('Error:', error);
          res.status(500).json({ error: 'An error occurred while fetching the search results' });
      });
});
app.use('/articles',articleRouter);
app.listen(PORT,()=>{
    console.log(`listening to the port ${PORT}`);
})
