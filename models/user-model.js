const mongoose = require("mongoose");

//定義每筆使用者資料的結構
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 512,
    },
    googleID:{
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    thumbnail:{
        type: String,
    },

    // for local login
    email:{
        type: String,
    },
    password:{
        type: String,
        maxlength: 1024,
    }
});

module.exports = mongoose.model("User", userSchema);
