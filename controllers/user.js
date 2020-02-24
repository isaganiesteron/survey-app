const validator = require('validator');
const bcrypt = require('bcrypt');
const locallydb = require('locallydb')
let db = new locallydb('././db')

function authentication(req){
  if(req.session.user && req.session.admin)
    return true
  else
    return false
}

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  let users = db.collection('users')
  const validationErrors = [];
  if (validator.isEmpty(req.body.username)) validationErrors.push({ msg: 'Username cannot be blank.' });
  if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/login');
  }

  let existingUser = users.where({username: req.body.username}).items
  if(existingUser.length > 0){
    bcrypt.compare(req.body.password, existingUser[0].password, (err, isMatch) => {
      if(!isMatch){
        req.flash('errors', { msg: 'Password Invalid'});
        return res.redirect('/login');
      }
      req.session.user = {
        id: existingUser[0].cid,
        username: existingUser[0].username,
        email: existingUser[0].email
      };
      req.session.admin = true;
      return res.redirect('/admin');
    });

  } else {
    req.flash('errors', { msg: 'Email or Password Invalid.'});
    return res.redirect('/login');
  }
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  //req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  let users = db.collection('users')
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });
  if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/signup');
  }
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

  let user = {
    email: req.body.email,
    password: req.body.password
  }

  //Password hash middleware.
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;

      let existingUser = users.where({email: req.body.email})
      if(existingUser.length > 1){
        req.flash('errors', { msg: 'Account with that email address already exists.' });
        return res.redirect('/signup');
      } else {
        if(collection.insert(user)){
          req.session.user = existingUser.email;
          req.session.admin = true;
          return res.redirect('/admin');
        } else {
          req.flash('errors', { msg: 'Something went wrong. Please try again.' });
          return res.redirect('/signup');
        }
      }
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  if(authentication(req)){
    res.render('account/profile', {
      title: 'Account Management'
    });
    
  } else {
    res.redirect('/');
  }
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  if(authentication(req)){
    let users = db.collection('users')
    const validationErrors = [];
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' });
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' });
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/account');
    }
    let user = {
      email: req.body.email,
      password: req.body.password
    }

    //Password hash middleware.
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { return next(err); }
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) { return next(err); }
        user.password = hash;

        let existingUser = users.get(parseInt(req.body.id))
        if(existingUser){
          users.update(existingUser.cid,{password: user.password})	//replace name with "newname" for item with cid

          req.flash('success', { msg: 'Password is now updated. Please login with your new password.' });
          req.session.destroy((err) => {
            if (err) console.log('Error : Failed to destroy the session during logout.', err);
            req.user = null;
            res.redirect('/admin');
          });
      
        } else {
          req.flash('errors', { msg: 'User doesnt exist' });
          return res.redirect('/');
        }
      });
    });
  } else {
    res.redirect('/');
  }
};


/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  if(authentication(req)){
    let users = db.collection('users')
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' });

    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect('/account');
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });
    
    let existingUser = users.get(parseInt(req.body.id))
    if(existingUser){
      users.update(existingUser.cid,{username: req.body.username , email: req.body.email})	//replace name with "newname" for item with cid
      req.session.user = {
        id: existingUser.cid,
        username: req.body.username,
        email: req.body.email
      };

      req.flash('success', { msg: 'Profile updated.' });
      return res.redirect('/account');

    } else {
      req.flash('errors', { msg: 'Email or Password Invalid.'});
      return res.redirect('/login');
    }
  } else {
    res.redirect('/');
  }
};