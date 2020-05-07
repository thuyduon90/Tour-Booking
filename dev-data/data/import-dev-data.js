const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
console.log(process.env.DATABASE);

const Tour = require('../../models/tourModel');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connected!'));

/* START SERVER */

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const importData = async() => {
    try {
        await Tour.create(tours);
        console.log('Data was loaded');
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
};

const deleteData = async() => {
    try {
        await Tour.deleteMany();
        console.log('Data was deleted');
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit();
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);

// RUN: node ./dev-data/data/import-dev-data.js --delete
// RUN: node ./dev-data/data/import-dev-data.js --import