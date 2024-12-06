import passport from 'passport';
import localStrategy from 'passport-local';
import { User, makeUser } from '../models/user.model.js';

passport.serializeUser((user, done) => {
	//funkcja otrzymuje zautoryzowanego usera z authUser()
	//wywołany done i passport zapisze id usera do req.session.passport.user
	//w ten sposób dane uzytkownika zapisane są w sesji czyli np { id:, name: "user#00001", surname: "Dadej"}
	//To id będzie uzyte przez deserializeUser() do pobrania pełnych danych uzytkownika

	console.log('serializeUser: user.id', user.id);
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	// funkcja na podstawie przekazanego id pobiera  pałene dane uzytkownika np z bazy i zwraca je do done(), dzdięki temu trafia on do req.user i moze być uzyty gdziekolwiek w apce

	try {
		const userDb = await User.findById(id);
		console.log('deserializeUser(), userDb: ', userDb);
		done(null, userDb);
	} catch (err) {
		done(err);
	}
});

//rejestracja usera na stronie

passport.use(
	'local-signup',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				const userExists = await User.findOne({
					email: email,
				});
				if (userExists) {
					//jest w bazie
					return done(null, false);
				}
				const user = makeUser(email, password);
				const userDb = await user.save();
				return done(null, userDb); //user jest zarejestrowany
			} catch (error) {
				done(error);
			}
		}
	)
);

const authUser = async (req, email, password, done) => {
	// authUser to funkcja pozwalająca na autoryzacje uzytkownika, zwraca zautoryzowanego
	//uzytkownika np z bazy, authUser uzywana ejst przez strategie do autoryzacji usera

	try {
		const authenticatedUser = await User.findOne({ email });

		if (!authenticatedUser) {
			// nie ma usera w bazie z tym email
			return done(null, false);
		}

		if (!authenticatedUser.validPassword(password)) {
			// złe hasło
			return done(null, false);
		}

		return done(null, authenticatedUser); //zwraca zalogowanego usera, prawidłowy email i poprawne hasło
	} catch (error) {
		return done(error);
	}
};

passport.use(
	'local-login',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		authUser
	)
);


export{
    passport
}