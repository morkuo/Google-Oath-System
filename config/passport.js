const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

//製作Cookies存進瀏覽器，維持已登入狀態
passport.serializeUser((user,done)=>{
    done(null,user._id);
});

//解讀傳入請求附隨的Cookies，辨認已登入之使用者
passport.deserializeUser((_id,done)=>{
    User.findOne({_id}).then((user)=>{
        done(null,user);
    });
});

//Google帳號登入
passport.use( new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,         //CliendID、ClientSecret 須至Ｇoogle Cloud Console 設定、取得
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"/auth/google/redirect",            //如果登入成功將導向此路徑 => 參routes/auth-route.js
    },
 
    // verify callback：找Google帳號是否已在使用者資料庫內，如果還沒，在資料庫中建立資料
        (accessToken, refreshToken, profile, done)=>{
            User.findOne({id: profile.id})
                .then((foundUser)=>{
                    if(foundUser){
                        done(null,foundUser);
                    }
                    else{
                        new User({
                            name: profile.displayName,
                            googleID: profile.id,
                            thumbnail: profile.photos[0].value,
                        })
                        .save()
                        .then((user)=>{
                            done(null,user);
                        });
                    }
                });
        }
    )
);

//本地帳號登入
passport.use( new LocalStrategy(
    //username為使用者輸入的email，之所以是username，是因為HTML form email input 的 name屬性設定成username
    (username, password, done)=>{ 
        User.findOne({email: username})
        .then(async (user)=>{
            if(user){
                await bcrypt.compare(password, user.password, (err,result)=>{
                    if(err){
                        return done(null,false);
                    }
                    else if(result){
                        return done(null,user);
                    }
                    else{
                        return done(null,false);
                    }
                });
            }
            else{
                return done(null,false);
            }
        })
        .catch((e)=>{
            return done(null,false);
        });
    })
);