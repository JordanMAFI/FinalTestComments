const { User, Message } = require('../models/models.js')
const jwt = require('jsonwebtoken')
const { Router } = require('express')
const router = Router()

//index root to home page upon localhost request
router.get('/', async function (req, res){
    let messages = await Message.findAll({})
    let data = { messages }

    res.render('index.ejs', data)
})

// This route that is executed when the user click love button
router.post('/count', async function(req, res){
    let {token} = req.cookies;

    // get user id from the logged in user that clicked on it                                                         
    if(token) {                                               
    let id= req.body.id
    let message = await Message.findOne({where: {id: id}})
    // increment user likes
    message.count++;
    //save to db
    await message.save()
    //console log the likes counts
    console.log(message.count)
    }
    res.redirect('/')
})

//render the createUser page
router.get('/createUser', async function(req, res){
    res.render('createUser.ejs')
})
//Takes in the username and password
router.post('/createUser', async function(req, res){
    let { username, password } = req.body

    try {
        await User.create({
            username,
            password,
            role: "user"
        })  
    } catch (e) {
        console.log(e)
    }

    res.redirect('/login')
})

//render the login page after signing up
router.get('/login', function(req, res) {
    res.render('login')
})
//check for user credintials for validations
router.post('/login', async function(req, res) {
    let {username, password} = req.body

   let user;
    try {
        user = await User.findOne({
            where: {username}
                
        })
    } catch (e) {
        console.log(e)
    }
    //validation for db password and usernmae typed
    if (user && user.password === password) {
        let data = {
            username: username,
            role: user.role
        }

        let token = jwt.sign(data, "theSecret")
        res.cookie("token", token)
        res.redirect('/')
    } else {
        res.redirect('/error')
    }
})
//check message content from logged in user
router.get('/message', async function (req, res) {
    let token = req.cookies.token 
//if message entered , render it
    if (token) {                                     
        res.render('message')
//else render only the login page
    } else {
        res.render('login')
    }
})

//Content posted validation from the right user
router.post('/message', async function(req, res){
    let {token} = req.cookies
    let {content } = req.body
    
   if (token) { 
    let payload = await jwt.verify(token, "theSecret")  
 
    let user = await User.findOne({
        where: {username: payload.username}
    })
    
    let msg = await Message.create({
        content,
        userId: user.id
    })

        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})
//render the error ejs page 
router.get('/error', function(req, res){
    res.render('error.ejs')
})

// matches every http protocol verbs and put 404  error if an error occurs in a routes
router.all('*', function(req, res){
    res.send('404 dude')
})

module.exports = router