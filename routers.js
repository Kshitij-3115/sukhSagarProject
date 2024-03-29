//all routers are present in this file 
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fastTwoSms = require('fast-two-sms');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const addToDb = require('./dbUtil');
const dbUtils = require('./dbUtil');
const { query } = require('express');

//set up the body parser -> 
router.use(bodyParser.urlencoded('extended : false'));
router.use(bodyParser.json());
//let our router use express-session 
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//set up multer --> 
let options = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
    // fileFilter: (req, file, cb) => {
    //     if (path.extname(file.originalname) === '.pdf') {
    //         return cb(null, true);
    //     }
    //     cb(new Error("only .pdf files are allowed."));
    // },
    limits: {
        fileSize: 2 * Math.pow(10, 6) //2 MB max size 
    }
}
const upload = multer(options).single('resumeFile'); //upload.single('resumeFile')


//------------------now define routes here ------------------
router.post('/sendOTP', async (req, res) => {
    console.log(req.body);
    const otp = Math.floor(100000 + Math.random() * 900000);


    // res.send({isSent : true, otp : otp}); 
    const mobile = req.body.mobile; //mobile number
     
    const {wallet} = await fastTwoSms.getWalletBalance('DqsK9hwhC6MH0LQjYM96m8TgVGqyLhEMRJQJnSV5CtRrw3aDGuF4pyjPOzYH');
    console.log(wallet); 
    const options = { authorization: "DqsK9hwhC6MH0LQjYM96m8TgVGqyLhEMRJQJnSV5CtRrw3aDGuF4pyjPOzYH", message: otp, numbers: [mobile] };
    const response  = await fastTwoSms.sendMessage(options);
    console.log(response); 
    if(response) {
        res.send({isSent : true, otp : otp});
    } else {
        res.send({isSent : false, otp : otp}); 
    }
//     then((response) => {
//         console.log("response : ", response);
//         res.send({ isSent: true, otp: otp });
//     });
})

router.post('/submit', (req, res) => {
    //req.file - file uploaded 
    //req.body - other text fields data (form)
    let statusObj; //status of file uploading
    let rb;

    upload(req, res, (err) => {
        rb = req.body;
       
        if (err) {
            //multer error
            if (err.code == 'LIMIT_FILE_SIZE') {
                err.message = "file is larger than allowed size.";
                err.success = false;
                res.render('err.pug',{message : 'file is larger than allowed size!'}); 
                res.end(); 
            } 
            res.render('err.pug',{message : err}); 
            res.end(); 
            statusObj = err;
        } else {
            console.log(req.file);
            if (!req.file) {
                res.status(500);
                res.json('file not found!');
                return res.end(); 
            }
            statusObj = {
                success: true,
                message: 'File uploaded successfully'
            }
        }
        // now we need to store this data to database. 
        const obj = {
            fname: rb.fname,
            mname: rb.mname,
            lname: rb.lname,
            email: rb.email,
            passwd: rb.passwd,
            mobile: rb.mobile,
            address: rb.address,
            education: rb.edu,
            dob: rb.dob,
            pin: rb.pin,
            place: rb.place,
            state: rb.state,
            country: rb.country,
            resume: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.originalname)),
                contentType: 'file'
            }
        }
        dbUtils.addToDb(obj, (err, result) => {
            console.log('reached on 112');
            if (err) {
                console.log('reached on 114');
                res.render('err',{message : 'a database error occured!'}); 
            } else {
                console.log('reached on 117'); 
                if(result.length === 0) {
                    //item array is empty => not uploaded to db 
                    console.log('reached on 120'); 
                    res.status(500); 
                   return  res.render('err',{message:'a database error occured! please try after some time.'}); 
                }
                //uploaded to db ===> user registration successfull
                console.log('reached on 125');
                res.status(200);
                console.log('reached on 127');
                res.render('msg.pug');
            }
        })

    });
})

router.post('/login', (req, res) => {
    console.log(req.body);
    let queryObj = {
        email: req.body.email,
        passwd: req.body.password
    }
    if (queryObj.email && queryObj.passwd) {
        dbUtils.findInDb(queryObj, (err, data) => {
            if (err) {
                error = {
                    message: 'a database error occured!'
                }
                res.render('err', error);

            } else {
                if (data[0]) {
                    console.log(data);
                    req.session.loggedin = true;
                    req.session.username = data[0].fname + ' ' + data[0].lname;
                    res.redirect('/user/profile');
                } else {
                    let error = {
                        message: 'email or password is incorrect! try again.'
                    }
                    res.render('err', error);
                }

            }
        })
    }

})

router.get('/profile', (req, res) => {

    if (req.session.loggedin) {
        // res.send('Welcome back, ' + req.session.username + '!');
        const auth = {
            loggedin: true,
            username: req.session.username
        }


        res.render('profile', auth);
    } else {
        let auth = {
            loggedin: false,
            username: undefined
        }
        res.render('profile', auth);
    }
    res.end();
})

router.get('/logout', (req, res) => {
    if (req.session.loggedin) {
        req.session.destroy((err) => {
            if (err) {
                let error = "sorry, we can't log you out!"
                res.render('err', error);
            } else {
                //logged out successfully
                res.redirect('/'); //home
            }
        })
    } else {
        res.redirect('/'); //home, user already logged out!
    }
})
module.exports = router
