const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/users');
const Place = require('./models/place');
const Booking = require('./models/booking');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const fs = require('fs');
const multer = require('multer');
const app = express();
const mime = require('mime-types');
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'jwqlokejrokjd';
const bucket = 'airbnb-michael-booking';



app.use(express.json());
app.use(cookieParser());
app.use('/api/uploads', express.static(__dirname + '/api/uploads'));

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));


async function uploadToS3(path, orginalFilename, mimetype) {
    const client = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });
    const parts = orginalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: 'public-read',
    }));
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`
}
    



app.post('/api/register', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {name, email, password} = req.body;

    try {
        const user = await User.create({
                name,
                email,
                password:bcrypt.hashSync(password, bcryptSalt),
            });
            res.json(user);
    } catch (err) {
        res.status(422).json(err);
    }

});

app.post('/api/login', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if (user) {
        const passOk = bcrypt.compareSync(password, user.password)
        
        if (passOk) {
            jwt.sign({
                email: user.email,
                id: user._id,
                name: user.name,
            }, jwtSecret, {}, (err, token) => {
                if (err) {
                    throw err;
                } else {
                    res.cookie('token', token).json(user);
                }
            });
        } else {
            res.status(422).json('pass not ok');
        }
    } else {
        res.json('not found');
    }
});

app.get('/api/profile', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            
            res.json(userData);
        })
    } else {
        res.json(null);
    }
    res.json({token});
});

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

app.post('/api/upload-by-link', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {link} = req.body;
    const newName = 'photo:' + Date.now() + '.jpg';

    await imageDownloader.image({
        url: link,
        dest: '/tmp/' + newName,
    });

    const url = await uploadToS3('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName));
    res.json(url);
    

});

const photosMiddleware = multer({dest: '/tmp'});
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname, mimetype} = req.files[i];
        const url = await uploadToS3(path, originalname, mimetype);
        uploadedFiles.push(url);
    }
    res.json(uploadedFiles);
});

app.post('/api/places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);

    const {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body;
    
    const {token} = req.cookies;
    
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price,
        });
        res.json(placeDoc);
    })
})

app.get('/api/user-places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {id} = userData;
        res.json( await Place.find({owner: id}))
    });
});

app.get('/api/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    res.json(await Place.findById(id))
})

app.put('/api/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body;
    
    const {token} = req.cookies;

    
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price,
            })
            await placeDoc.save();
            res.json('ok')
        }
    })

})

app.get('/api/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json(await Place.find())
});

app.post('/api/booking', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;

        const {place, checkIn, checkOut, numGuusts, name, phone, price} = req.body;
        
        Booking.create({place, user: userData.id, checkIn, checkOut, numGuusts, name, phone, price})
        .then((doc) => {
            res.json(doc);
        }).catch((err) => {
            throw err;
        });

    })


});

app.get('/api/booking', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        res.json( await Booking.find({user: userData.id}).populate('place'))
    })
});

app.listen(4000);

