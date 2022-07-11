import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	url: String,
	email: {
		type: String,
		lowercase: true,
		validate: {
			validator: (v) =>
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
			message: '{VALUE} is not a valid email.',
		},
	},
});

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		minLength: 5,
		maxLength: 255,
		trim: true,
	},
	description: String,
	numberOfPages: {
		type: Number,
		min: 10,
		max: 2000,
		required: true,
	},
	language: String,
	imageUrl: String,
	buyUrl: String,
	whenCreated: {
		type: Date,
		default: () => Date.now(),
	},
	relatedBook: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: 'book',
	},
	topics: [String],
	author: authorSchema,
	whenUpdated: Date,
});

bookSchema.methods.enhanceTitle = function () {
	if (this.numberOfPages >= 200) {
		this.title = this.title + ' (long book)';
	}
};

bookSchema.statics.findShortEnglishBooks = function () {
	return this.where('language')
		.equals('english')
		.where('numberOfPages')
		.lte(200);
};

bookSchema.statics.findShortBooksByLanguage = function (language) {
	return this.where('language')
		.equals(language)
		.where('numberOfPages')
		.lte(200);
};

bookSchema.query.byLanguage = function (language) {
	return this.where('language').equals(language);
};

bookSchema.virtual('bookInfoText').get(function () {
	return `${this.title}, ${this.numberOfPages} pages: ${this.description}`;
});

bookSchema.set('toJSON', { virtuals: true });

bookSchema.pre('save', function (next) {
	this.whenUpdated = Date.now();
	next();
});

bookSchema.post('save', function (doc, next) {
	const dt = new Date();
	const timestamp = dt.toISOString();
	console.log(`${timestamp}: updated book "${doc.title}`);
	next();
});
//methods
bookSchema.methods.enhanceTitle = function () {
	if (this.numberOfPages >= 200) {
		this.title = this.title + ' (long book)';
	}
};
//static methods
bookSchema.statics.findShortEnglishBooks = function () {
	return this.where('language')
		.equals('english')
		.where('numberOfPages')
		.lte(200);
};
bookSchema.statics.findShortBooksByLanguage = function (language) {
	return this.where('language')
		.equals(language)
		.where('numberOfPages')
		.lte(200);
};

export const Book = mongoose.model('book', bookSchema);
 