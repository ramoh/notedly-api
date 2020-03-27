module.exports = {
    //Resolve the author information of a note when requested
    author: async (note, args, {models}) => {
        return models.User.findById(note.author);
    },
    //Resolve the favortedBy info for a note when requested
    favoritedBy: async (note, args, {models}) => {
        return models.User.find({_id: {$in: note.favoritedBy}});
    }
};