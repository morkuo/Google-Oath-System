const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes/auth-route");
const profileRoute = require("./routes/profile-route");
require("./config/passport");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

//連接 MongoDB Atlas
mongoose.connect(
    process.env.DB_CONNECT, 
    {useNewUrlParser: true, useUnifiedTopology: true}
).then(()=>{
    console.log("Connected to MongoDB Atlas.");
})
.catch((e)=>{
    console.log(e);
});

//view engine 宣告為 ejs
app.set("view engine", "ejs");

//解讀傳入請求的資料格式
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//透過 express-session + flash + res.locals 在使用者註冊、登入時，顯示對應訊息（例如註冊成功、密碼錯誤） => 參routes/auth-route.js的「本地帳號登入」部分，及 views/partials/message.ejs
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.foundEmail_msg = req.flash("foundEmail");
    res.locals.validationFailed_msg = req.flash("validationFailed");
    res.locals.newUser_msg = req.flash("newUser");
    res.locals.error_msg = req.flash("error"); //LocalStrategy failureFlash所設定的錯誤訊息，會傳入req.flash("error") 
    next();
});

//透過 passport 做第三方帳號登入所須設定 (passport serialize and deserialize)
app.use(passport.initialize());
app.use(passport.session());

//路由：特定路徑交由獨立模組處理 => 參 routes/auth-route.js, profile-route.js 
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

// 渲染index並送出使用者資訊（已登入時才有 req.user）
app.get("/",(req,res)=>{
    res.render("index.ejs",{user: req.user});
});

//在PORT：8080，運行伺服器
app.listen(8080,(req,res)=>{
    console.log("Server is running on port 8080.");
});
