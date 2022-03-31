const mongoose = require("mongoose");

//定義每筆使用者貼文的結構
const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now(),
    },
    author:{
        type: String,
    },
});

module.exports = mongoose.model("Post", postSchema);