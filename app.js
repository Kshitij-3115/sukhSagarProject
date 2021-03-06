const express = require('express');
const router = require('./routers.js'); 
const http = require('http'); 

//init app
const app = express();
// const httpServer = http.createServer(app); 
const port = process.env.PORT || 3000; 

//set up views --> 
app.set('view engine', 'pug'); 
//serve static assets --> 
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/signup', (req, res) => {
    res.render('signup');
})


app.use('/form',router); 


app.use('/user',router);
//start server -> 
const server = app.listen(port, () => {
    console.log(`server is up on port number ${port}`); //server started! 
})

server.on('clientError',(err,socket) => {
    console.log(err);
})

