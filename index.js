const express=require("express");
const app=express();
const articleRouter=require("./routes/articles");
const mongoose=require("mongoose");
const { Article, User } = require("./models/article");
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const PORT=process.env.PORT || 5000;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const methodOverride=require("method-override");

const connectionString =

//mongodb atlas connection establishment
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
//console.log(path.join(__dirname,'/views'));
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'partials'));


app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'your-secret-key', // Replace with your own secret key
  resave: false,
  saveUninitialized: true
}));

// Passport session setup.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(
  new GoogleStrategy(
    
    {
      
      clientID:process.env.CLIENT_ID,
      clientSecret:process.env.CLIENT_SECRET ,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      //'https://interview-exp.onrender.com/auth/google/callback',
      passReqToCallback: true, // Add this line to pass the req object to the callback
      scope: ['profile', 'email'],
    },
    (req,token, tokenSecret, profile, done) => {
      // Check if profile.emails is defined and not empty
      if (profile.emails && profile.emails.length > 0) {
        // Extract user's email from the profile
        const userEmail = profile.emails[0].value;
        const userProfilePic = profile.photos && profile.photos.length > 0
        ? profile.photos[0].value
        : null;

        // Store the user's email in the session
        req.session.userEmail = userEmail;
        req.session.userProfilePic = userProfilePic; // Store profile picture URL
        console.log(req.session.userProfilePic);
        console.log(req.session.userEmail);

      }
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// Routes for authentication.
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/all-articles');
  }
);



function authenticateUser(req, res, next) {
  if (req.user.emails[0].value) {
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



app.post("/articles",async (req,res)=>{


  const userEmail = req.user.emails[0].value;
    let article= new Article({
        company_name:req.body.company_name,
        job_role:req.body.job_role,
        candidate_name:req.body.candidate_name,
        email:userEmail,
        strategy:req.body.strategy,
        journey:req.body.journey,

        
    })
    try{
       article =await article.save();
       res.redirect(`/articles/${article.id}`);

    }catch(e){
      console.log(e);
        res.render("articles/new",{article:article});
    }
     



        
}
);

app.get('/all-articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: 'desc' });
   
    res.render('articles/index1.ejs', { articles : articles ,ProfilePic: req.session.userProfilePic, userEmail: req.session.userEmail });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/my-articles', authenticateUser, async (req, res) => {
  // if (!req.session.userEmail) {
  //   res.redirect('/login');
  //   return;
  // }

  try {
     userEmail = req.user.emails[0].value;;
    const articles = await Article.find({ email: userEmail }).sort({ createdAt: 'desc' });
    res.render('articles/myarticles', { articles: articles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  // Use req.logout() with a callback function
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
    }

    // Optionally, you can also destroy the entire session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        // Redirect to the home page or any desired destination after logout
        res.redirect('/');
      }
    });
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

app.get('/search', (req, res) => {
  const searchQuery = req.query.query;

  // Fetch articles from the database based on the search query
  Article.find({ company_name: { $regex: searchQuery, $options: 'i' } })
      .then(articles => {
          res.render('articles/search1', { articles });
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
