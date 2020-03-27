const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {AuthenticationError, ForbiddenError} = require("apollo-server-express");
require("dotenv").config();
const mongoose = require("mongoose");

const gravatar = require("../util/gravatar");

module.exports = {
    newNote: async (parent, args, {models, user}) => {
        //if there is no user then throw authentication error 
        if (!user) {
            throw new AuthenticationError("You must be signed in to create a note");
        }
        return models.Note.create({
            content: args.content,
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    deleteNote: async (parent, {id}, {models, user}) => {
        //if not a user , throw an Authentication Error 
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete the note");
        }
        //find the note 
        const note = await models.Note.findById(id);
        //if the note owner and current user does not match throw forbidden error 
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permission to delete the note");
        }
        try {
            await note.remove();
            return true;

        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, {content, id}, {models, user}) => {
        //if not a user , throw an Authentication Error 
        if (!user) {
            throw new AuthenticationError("You must be signed in to update the note");
        }

        //find the note 
        const note = await models.Note.findById(id);
        //if the note owner and current user does not match throw forbidden error 
        if (note && String(note.author) != user.id) {
            throw new ForbiddenError("You don't have permission to update the note");
        }

        //update the note in the db and return updated note
        return models.Note.findOneAndUpdate(
            {
                _id: id
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        );
    },
    signUp: async (parent, {username, email, password}, {models}) => {

        //normalize the email address 
        email = email.trim().toLowerCase();

        //hash the password
        const hashed = await bcrypt.hash(password, 10);
        //create the gavtaar url
        const avtar = gravatar(email);

        try {
            const user = await models.User.create({
                username,
                email,
                avtar,
                password: hashed

            });

            //create and return the json web token 
            return jwt.sign({id: user._id}, process.env.JWT_SECRET);
        } catch (err) {
            console.log(err);
            //If there is a problem creating the account throw an error 
            throw new Error("Error creating account");
        }

    },
    signIn: async (parent, {username, email, password}, {models}) => {

        if (email) {
            //normalize the email
            email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{username}, {email}]
        });

        //if no user is found ,throw an authentication error 
        if (!user) {
            throw new AuthenticationError("Error signing in ");
        }

        //if password does not match throw an authentication error
        const valid = await bcrypt.compare(password, user.password);

        //if password does not match throw an authentication error
        if (!valid) {
            throw new AuthenticationError("Error signing in");

        }

        //create and return the json web token
        return jwt.sign({id: user._id}, process.env.JWT_SECRET);

    },
    toggleFavorite: async (parent, {id}, {models, user}) => {

        //if no user context is passed ,throw auth error
        if (!user) {
            throw new AuthenticationError();
        }

        //check to see if user has favorited the note 
        let noteCheck = await models.Note.findById(id);

        const hasUser = noteCheck.favoritedBy.indexOf(user.id);

        //if the user exist in the list then pull it out from the list and 
        //reduce the count by 1
        if (hasUser >= 0) {
            return models.Note.findByIdAndUpdate(
                id, {
                    $pull: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: -1
                    }
                }, {
                    //set new to true to return updated document
                    new: true
                }
            );
        } else {
            //if user doesnot exist then add them to list and increment the count by 1
            return models.Note.findByIdAndUpdate(
                id, {
                    $push: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    }, $inc: {
                        favoriteCount: 1
                    }
                }, {
                    new: true
                }
            );
        }


    }


};