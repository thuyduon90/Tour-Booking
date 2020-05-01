const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name);
    console.log(err.message);
    console.log(
        'UNCAUGHT EXCEPTION 🎆. Now, server will shutdown...'
    );
    process.exit(1);
});

dotenv.config({ path: './config.env' });

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

const app = require(`${__dirname}/app`);

/* START SERVER */
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name);
    console.log(err.message);
    console.log(
        'UNHANDLED REJECTION 🎆. Now, server will shutdown...'
    );
    server.close(() => {
        process.exit(1);
    });
});