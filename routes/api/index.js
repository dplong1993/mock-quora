const express = require('express');
const router = express.Router();

const userRouter = require('./users');
const answerRouter = require('./answers');
const topicRouter = require('./topics')
//const testRouter = require('./test');
const homeRouter = require('./home')
const testRouter = require('./test');
const queriesRouter = require('./queries');
const interestsRouter = require('./interests');
const questionTopicsRouter = require('./questionTopics');
const { environment } = require('../../config');
const { ValidationError } = require('sequelize');
const { getUserFromToken } = require('../utils/auth');

//Sets up key of user on all reqs if there is a token in the cookies
// and sets the value of the key to the user the token corresponds to.

router.use(async (req, res, next) => {
  //Get the token from cookies
  const token = req.cookies.token;

  //If there is no token in cookies go to next middleware
  if (!token) return next();

  //There is token in cookies, so get the user associated with that token
  const user = await getUserFromToken(token);

  //If getting user was successful, set key of user on req to the fetched user
  if(user) req.user = user;

  next();
});

router.use('/users', userRouter);
router.use('/answers', answerRouter);
router.use('/topics', topicRouter)
//router.use('/test', testRouter);
router.use('/home', homeRouter);
router.use('/test', testRouter);
router.use('/queries', queriesRouter);
router.use('/interests', interestsRouter);
router.use('/questionTopics', questionTopicsRouter);

router.use((err, req, res, next) => {
  if(err instanceof ValidationError){
    err.errors = err.errors.map(e => e.message);
  }
  next(err);
})

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === "production";
  if (!isProduction) console.log(err);
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

// router.use('*', (req, res) => {
//   res.status(404).json({message: 'route does not exist'});
// })

module.exports = router;
