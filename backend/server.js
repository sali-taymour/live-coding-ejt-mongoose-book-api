import express from 'express';
import mongoose from 'mongoose';
import { Book } from './models/Book.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_CONNECTION =
	process.env.MONGODB_CONNECTION || 'mongodb://localhost/bookapi';

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
	try {
		await book.save();
		res.status(200).json({
			message: 'book created',
			book,
		});
	} catch (err) {
		res.status(400).json({ error: err.message, invalidBook: book });
	}
});

app.get('/book', async (req, res) => {
	const books = await Book.find().sort({ title: 1 });
    books.forEach(book => book.enhanceTitle());
	res.status(200).json({
		message: 'fetched all books',
		books,
	});
});

app.get('/books-by-language/:language', async (req, res) => {
	const language = req.params.language;
	const books = await Book.where('language')
		.equals(language)
		.sort('title')
		.populate('relatedBook');
	books.forEach((book) => console.log(book.enhanceTitle()));
	res.status(200).json({
		message: `fetched all books written in ${language}`,
		books,
	});
});

app.get('/short-english-books', async (req, res) => {
	const books = await Book.findShortEnglishBooks();
	res.status(200).json({
		message: `fetched all short books in English`,
		books,
	});
});

app.get('/short-books-by-language/:language', async (req, res) => {
	const language = req.params.language;
	const books = await Book.findShortBooksByLanguage(language);
	res.status(200).json({
		message: `fetched all short books in ${language}`,
		books,
	});
});

app.get('/long-books-by-language/:language', async (req, res) => {
	const language = req.params.language;
	const books = await Book.where()
		.byLanguage(language)
		.where('numberOfPages')
		.gt(200);
	res.status(200).json({
		message: `fetched all long books in ${language}`,
		books,
	});
});

app.get('/book/:id', async (req, res) => {
	const id = req.params.id;
	const book = await Book.findOne({ _id: id });
    book.enhanceTitle();
	res.status(200).json({
		message: 'fetched book with id ' + id,
		book,
	});
});

app.put('/book/:id', async (req, res) => {
	const id = req.params.id;
	const oldBook = await Book.findOne({ _id: id });
	await Book.updateOne({ _id: id }, { $set: { ...req.body } });
	const newBook = await Book.find({ _id: id });
	res.status(200).json({
		message: 'replaced book with id=' + id,
		oldBook,
		newBook,
	});
});

app.patch('/book/:id', async (req, res) => {
	const id = req.params.id;
	const oldBook = await Book.findOne({ _id: id });
	const book = await Book.findOne({ _id: id });
	Object.entries(req.body).forEach((kv) => {
		book[kv[0]] = kv[1];
	});
	book.save();
	const newBook = await Book.findOne({ _id: id });
	res.status(200).json({
		message: 'patched book with id=' + id,
		oldBook,
		newBook,
	});
});

app.delete('/book/:id', async (req, res) => {
	const id = req.params.id;
	const book = await Book.find({ _id: id });
	await Book.deleteOne({ _id: id });
	res.status(200).json({
		message: 'deleted book with id=' + id,
		book,
	});
});

app.listen(port, () => {
	console.log(`listening on port: http://localhost:${port}`);
});
