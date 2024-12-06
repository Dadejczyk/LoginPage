import { mongoose } from '../utility/db.js';
import bcrypt from "bcryptjs"
//npm install bcryptjs

const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {
		type: String,
		required: false,
		trim: true,
		minLength: 1,
		maxLength: 32,
	},
	surname: {
		type: String,
		required: false,
		trim: true,
		minLength: 1,
		maxLength: 32,
	},
	password: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 32,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minLength: 1,
		maxLength: 32,
		unique: true,
		match: /.+\@.+\..+/,
	},
	created: {
		type: Date,
		default: Date.now,
	},
});

userSchema.pre('save', async function (next) {
	try {
		const user = this;
		if (!user.isModified('password')) return next();

		//haszuje hasło
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(this.password, salt);
		this.password = hashedPassword;
		next();
	} catch (err) {
		return next(err);
	}
});



//sprawdza czy podane hasło jest prawidłowe
userSchema.methods.validPassword = async function (password) {
	try {
		return await bcrypt.compare(password, this.password);
	} catch (err) {
		throw new Error();
	}
};

const User = mongoose.model("User", userSchema)


function makeUser(email, password){
    return new User({
        _id: new mongoose.Types.ObjectId(),
        email: email,
        password: password
    })
}

export{
    User,
    makeUser
}