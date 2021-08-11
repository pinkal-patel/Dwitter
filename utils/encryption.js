var config = require('../config');
var bcrypt = require('bcrypt');
var crypto = require('crypto');


// Get password hash with salt
let getEncryptedPasswordWithSalt = (password) => {
    var salt = bcrypt.genSaltSync(10);
    var passwordHashWithSalt = bcrypt.hashSync(password, salt);
    var passwordHash = passwordHashWithSalt.substring(29);
    return {
        password: passwordHash,
        salt: salt
    };
};

let getDecryptedPassword = (password, salt) => {
    var passwordHashWithSalt = bcrypt.hashSync(password, salt);
    var passwordHash = passwordHashWithSalt.substring(29);
    return passwordHash;
};

let comparePassword = (password, user) => {
    let passHash = getDecryptedPassword(password, user.passwordsalt);
    if (user.password == passHash) {
        return true
    } else {
        return false
    }
}

module.exports = {
    getEncryptedPasswordWithSalt: getEncryptedPasswordWithSalt,
    getDecryptedPassword: getDecryptedPassword,
    comparePassword: comparePassword
}