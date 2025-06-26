if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
console.log(process.env);


const express =  require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport =  require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// joi identifies the error

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
    .then(()=> {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// async function main() {
//     await mongoose.connect(dbUrl,);
// }

async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        ssl: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        tlsAllowInvalidCertificates: false,
        compressors: ['none'],
    });
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*60*60,
})

store.on("error", (err)=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,// major defense against Cross-Site Scripting (XSS) attacks.
    }
}


app.use(session(sessionOptions));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user ; 
    next();
});

app.get("/demouser", async(req,res)=> {
    let fakeUser = new User({
        email: "nitin@gmail.com",
        username: " nit-delhi"
    })

    let registeredUser = await User.register(fakeUser," hellowwaold")
    res.send(registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res,next) => {
    next(new ExpressError(404, "Page Not Found!"))
});

app.use((err,req,res,next) => {
    let {statusCode = 500, message="Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs", { message});
    
});

app.listen(8080, ()=> {
    console.log("server is listening to 8080");
});




