const router = require("express").Router();
const mongoose = require("mongoose");
const Post = require("../models/post-model");

//定義一個確認登入狀態的中間件，放進各路徑在各路徑執行前執行。效果是，如果使用者已登入，按執行各路徑設計的邏輯，如果尚未登入，記下請求頁面，導向登入頁面。
const authCheck = (req, res, next)=>{
	if(req.isAuthenticated()){
		next();
	}
	else{
		req.session.returnTo = req.originalUrl;
		res.redirect("/auth/login");
	};
};

//POST
router.get("/post", authCheck, (req,res)=>{
    res.render("post.ejs",{user: req.user});
});

//將使用者新增貼文內容存進資料庫
router.post("/post", authCheck, (req,res)=>{
    let {title, content} = req.body;
    new Post({title, content, author: req.user._id})
    .save();
    res.redirect("/profile");
});

//在Profile頁面顯示使用者以往的貼文
router.get("/", authCheck, async (req,res)=>{
    let foundPost = await Post.find({author: req.user._id});
    res.render("profile.ejs",{user: req.user, posts: foundPost});
});

module.exports = router;