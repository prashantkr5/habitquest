const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)

.then(()=>{
    console.log('MongoDB is connected successfully bro..!');
})
.catch((error)=>{
    console.log('Error while connecting bro..!', error);
})