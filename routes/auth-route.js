const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

//渲染登入頁面
router.get("/login", (req,res)=>{
    res.render("login.ejs",{user: req.user});
});

//第三方帳號登入
router.get(
    "/google",
    passport.authenticate(
        "google",
        { scope: ["profile", "email"]}
    )
);

//如果第三方登入成功將導向這裡
router.get(
    "/google/redirect",
    passport.authenticate("google"),  //執行GoogleStrategy的Verify Callback => 參 config/passport.js

    //如果是未登入時請求需登入頁面，因此被導向此登入頁面而登入者，成功登入後導向先前請求頁面。否則，導向Profile。
    (req,res)=>{
        if(req.session.returnTo){
            let newPath = req.session.returnTo;
            req.session.returnTo = "";
            res.redirect(newPath);
		}
		else{
			res.redirect("/profile");  
		};
    }
);

//本地帳號登入
router.post("/login",
    passport.authenticate("local", { failureRedirect: "/auth/login", failureFlash: "Email or password is wrong."}),
    (req,res)=>{
        if(req.session.returnTo){
            let newPath = req.session.returnTo;
            req.session.returnTo = "";
            res.redirect(newPath);
		}
		else{
			res.redirect("/profile");  
		};
    }
);

//log Out
router.get("/logout", (req,res)=>{
    req.logOut();
    res.redirect("/");
});

//Sign Up
router.get("/signup", (req,res)=>{
    res.render("signup.ejs", {user: req.user});
});

//檢查註冊郵件是否重複，如果未重複，把使用者名稱、郵件、hash後密碼存進資料庫，導向登入頁面。
router.post("/signup", async (req,res)=>{
    let {name, email, password} = req.body;
    let foundEmail = await User.findOne({email});
    try{
        if (foundEmail){
            req.flash("foundEmail", "Email has been used."); //設定郵件重複時要顯示的對應訊息
            res.redirect("/auth/signup");
        }
        else{
            bcrypt.hash(password, 10, (err, hash)=>{
                new User({name, email, password: hash})
                .save()
                .then((newUser)=>{
                    console.log("new user created:", newUser);
                    req.flash("newUser","New user created. You can login.");
                    res.redirect("/auth/login");
                })
                .catch((e)=>{
                    req.flash("validationFailed", e.message);
                    res.redirect("/auth/signup");
                });
            });
        }
    }
    catch(error){
        console.log(error);
    }
});

module.exports = router;