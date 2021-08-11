module.exports = function(app) {
    require('../authentication/index')(app);
    require('../user/index')(app);    
    require('../profile/index')(app);
    require('../dwitter/index')(app);
};