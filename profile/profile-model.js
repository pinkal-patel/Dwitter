const userModel = require('../user/user-model');
const dwitterModel = require('../dwitter/dwitter-model');

let profile = {}

// It will fetch all user details with their follower & following count and its own dweets
profile.getUserProfile = (userId) => {
    return new Promise((resolve, reject) => {
        // call user model to extract user information
        userModel.getUserProfileDetails(userId).then((userData) => {
            // call dwitter model to fetch its own dweets
            dwitterModel.getDweetsOfUser(userId).then((dweets) => {
                userData.dweets = dweets;
                resolve(userData);
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });
    });
}

module.exports = profile;