import express from 'express';
import mongoose from 'mongoose';
import { Book } from './models/Book.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_CONNECTION = process.env.MONGODB_CONNECTION || 'mongodb://localhost/bookapi';

mongoose.connect(MONGODB_CONNECTION);

const app = express();
app.use(cors());
const port = 3459;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<h1>Book API</h1>`);
});

app.post('/book', async (req, res) => {
    const book = new Book(req.body);
    await book.save();
    res.status(200).json({
        message: 'book created',
        book
    });
});

app.get('/book', async (req, res) => {
    const books = await Book.find().sort({ title: 1 });
    res.status(200).json({
        message: 'fetched all books',
        books
    });
});

app.get('/book/:id', async (req, res) => {
    const id = req.params.id;
    const book = await Book.find({ _id: id });
    res.status(200).json({
        message: 'fetched book with id ' + id,
        book
    });
});

app.put('/book/:id', async (req, res) => {
    const id = req.params.id;
	const oldBook = await Book.find({ _id: id });
    await Book.updateOne({ _id: id }, {$set: {...req.body}});
	const newBook = await Book.find({ _id: id });
    res.status(200).json({
        message: 'replaced book with id=' + id,
		oldBook,
		newBook
    });
});

app.patch('/book/:id', async (req, res) => {
    const id = req.params.id;
	const oldBook = await Book.find({ _id: id });
    await Book.updateOne({ _id: id }, {$set: {...req.body}});
	const newBook = await Book.find({ _id: id });
    res.status(200).json({
        message: 'patched book with id=' + id,
		oldBook,
		newBook
    });
});

app.delete('/book/:id', async (req, res) => {
    const id = req.params.id;
	const book = await Book.find({ _id: id });
	await Book.deleteOne({ _id: id });
    res.status(200).json({
        message: 'deleted book with id=' + id,
		book
    });
});

app.listen(port, () => {
    console.log(`listening on port: http://localhost:${port}`);
});
