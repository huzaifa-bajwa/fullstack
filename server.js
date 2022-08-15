const express = require("express")
const app = express()
const mysql = require("mysql")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const path = require("path")
const ejs = require("ejs")
var cookieSession = require('cookie-session')
const {DateTime} = require("luxon")
require("dotenv").config()

const PORT = 3001


app.use(express.static("resources"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession ({
    name: "session",
    keys:[process.env.SESSION_KEY],
    maxAge: 24*60*60*1000
  }))
app.set("view engine","ejs")

const authenticateMiddleware = (req, res, next) => {
    if (req.session.hasOwnProperty("user_id") && req.session.hasOwnProperty("name")) {
        next()
    }
    else res.redirect("/login.html")
}


const con = mysql.createConnection(process.env.MY_SQL_CONNECTION)

con.connect((err)=>{
    if (err) throw err;
    else console.log("Connected to MySQL successfully.")
})

app.get("/", (req,res)=>{
   res.redirect("/login.html")
})

app.post("/signup", (req,res)=>{
    // SALTING in Hashing Passwords
    bcrypt.hash(req.body.password, 10, (err, hashed_password)=>{
        if (err) throw err;
        con.query(`INSERT INTO Users (name,email,password) VALUES ('${req.body.full_name}', '${req.body.email}', '${hashed_password}')`, (err, result)=>{
            if (err) res.send("An error has occured");
            else res.send("Sign Up Successful")
        })
    })
})

app.post("/login", (req,res)=>{
    const email = req.body.email
    const text_password = req.body.password
    con.query(`SELECT id, name, password FROM Users WHERE email='${email}'`, (err, results)=>{
        if (err) res.sendStatus(500)
        else {
            const correct_password_hash = results[0].password
            bcrypt.compare(text_password, correct_password_hash, (err, comparison_result)=>{
                if (err) throw err
                if (comparison_result) {
                    req.session.user_id = results[0].id
                    req.session.name = results[0].name
                    res.redirect('/feed')
                }
                else res.sendStatus(401)
            })
        }
    })
})

app.get("/myprofile", authenticateMiddleware, (req,res)=>{
    res.render("myprofile.ejs" ,{
        name: req.session.name
    })
})

app.get("/feed", authenticateMiddleware, (req,res)=>{
    res.render("feed.ejs", {
        name: req.session.name,
        user_id: req.session.user_id
    })
})

app.get("/logout", authenticateMiddleware, (req,res)=>{
    req.session = null
    res.redirect('/login.html')
})

app.get("/post/all", authenticateMiddleware, (req,res)=>{
    con.query("SELECT posts.id, posts.content, posts.date_posted, users.name, users.id AS user_id FROM posts INNER JOIN users ON posts.user_id=users.id;", (err, result) =>{
        if (err) res.sendStatus(500)
        else {
            result.map((post)=>{
                post.date_posted = DateTime.fromJSDate(post.date_posted).toFormat("yyyy LLL dd")
                return post
            })
            res.json(result)
        }
    })
})

app.post("/post/new", authenticateMiddleware, (req,res)=>{
    if (req.body.hasOwnProperty("content") && req.body.content != ""){
        con.query("INSERT INTO posts (content, user_id) VALUES (?, ?)", [req.body.content, req.session.user_id], (err, result) =>{
            if (err) res.sendStatus(500)
            else res.sendStatus(201)
        })
    }
    else res.sendStatus(400)
})

app.post("/post/delete", authenticateMiddleware, (req,res)=>{
    console.log(req.body.postID) 
    con.query(`DELETE FROM posts WHERE id = ${req.body.postID}`, (err, result) =>{
        if (err) res.sendStatus(500)
        else res.sendStatus(202)
    })
})

app.listen(process.env.PORT || PORT, ()=>{
    console.log("Server listening on port 3000.")
})