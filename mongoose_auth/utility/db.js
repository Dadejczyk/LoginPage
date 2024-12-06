import mongoose from 'mongoose';
const url = 'mongodb://127.0.0.1:27017/mongooseauth';

try {
	mongoose.connect(url);
} catch (error) {
	console.log(error);
}

export { mongoose };
