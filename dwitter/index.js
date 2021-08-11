const service = require('./dwitter-service');

module.exports = function(app) {

    //To add new dweets
    app.post('/dweet/post', service.save);
    //To like the specific dweet
    app.post('/dweet/like', service.likeDweet);
    //To unlike the specific dweet
    app.post('/dweet/unLike', service.removeLike);
    // To comment on the specific dweet
    app.post('/dweet/comment', service.commentDweet);
    // To search the dweets 
    app.post('/dweet/search', service.searchDweets);
    // To view all the latest dweets from the followed dweeters
    app.get('/dweet/view', service.viewDweets);

};