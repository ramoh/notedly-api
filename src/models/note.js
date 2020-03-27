//Require Mongooses library
const mongoose = require("mongoose");

//Define note's database schema
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    favoritedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    //Assign createdAt and updatedAt fields with Date type
    timestamps: true
});


//Define the 'Note' model with the schema
const Note = mongoose.model("Note", noteSchema);

//Export the module 
module.exports = Note;