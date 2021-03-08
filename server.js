const express = require('express');
const youtube = require('youtube-api');
const uuid = require('uuid').v4;
const cors = require('cors');
const open = require('open');
const multer = require('multer');
const fs = require('fs');

const PORT = 4000;
const credentials = require('./client_secret.json');
const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination :'./',
    filename(req,file,callback){
        const newFileName = `${uuid()}-${file.originalname}`
        callback(null,newFileName);
    }
})

const uploadVideoFile = multer({
    storage: storage,
    // single:'recfile',
}).single("VideoFile");



app.post('/upload',uploadVideoFile,(req,res)=>{
    if(req.file) {
        const filename = req.file.filename;
        const {title,description} = req.body;

        open(oAuth.generateAuthUrl({
            access_type:'offline',
            scope:'https://www.googleapis.com/auth/youtube.upload',
            state: JSON.stringify({
                filename,title,description
            })
        }))
    }
})

app.get('/oAuth2CallBack',(req,res)=> {
    res.redirect("http://google.com");
    
    const fileName = JSON.parse(req.query.state).filename;
    const title = JSON.parse(req.query.state).title;
    const description = JSON.parse(req.query.state).description;
    
    oAuth.getToken(req.query.code,(err,tokens)=>{
        if(err) {
            console.log(err);
            return;
        }

        oAuth.setCredentials(tokens);
        youtube.videos.insert({
            resource: {
                snippet : {title,description},
                status : {privacyStatus:'private'}
            },
            part: "snippet,status",
            media: {
                body:fs.createReadStream(fileName),
            }
        },(err,data) => {
            console.log("DONE!");
            console.log(data);
            process.exit();
        })

    })
})

const oAuth  = youtube.authenticate({
    type : 'oauth',
    client_id:credentials.web.client_id,
    client_secret: credentials.web.client_secret,
    redirect_url:credentials.web.redirect_uris[0],
})

app.listen(PORT,(req,res) => {
    console.log("app is listening on PORT 4000");
})
