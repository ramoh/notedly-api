//Require the mongoose library
const mongoose = require("mongoose");

module.exports = {
    connect: DB_HOST => {

        //Use the Mongo driver updated URL string parser
        mongoose.set("useNewUrlParser", true);
        //Use findOneAndUpdate() in place of findAndModify()
        mongoose.set("useFindAndModify", false);
        //Use createIndex() instead of ensureIndex()
        mongoose.set("useCreateIndex", true);
        //Use the new server discovery and monitoring engine
        mongoose.set("useUnifiedTopology", true);
        //connect to the DB
        mongoose.connect(DB_HOST);
        //Log an error if we fail to connect
        mongoose.connection.on("error", err => {
            console.error(err);
            console.log("MongoDB connection error.Please make sure MomgoDB is running");
            process.exit();
        });

    },
    close: () => {
        mongoose.connection.close();
    }
};