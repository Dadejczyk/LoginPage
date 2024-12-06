// logowanie z passport.js
// npm init -y
// npm i express passport express-session passport-local ejs
// oprócz passport-local mozemy dodac passport-google-oauth passport-facebook

import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from 'console';

const __dirname = dirname(fileURLToPath(import.meta.url)); // jest to adres naszego projektu gdzie index,js jest uruchomiony

const app = express();

//parsuje dane przesłąne przez post do naszej aplikacji
//dostepne beda w req.body

app.use(express.urlencoded({ extended: false })); // domyślna wartośc

//middleweare
//sesja polegająca na zapisaniu informacji na temat uzytkownika na serwerze w bazie danych albo w session-store
//dodatkowo sesja ma unikalny swój identyfikator który przesyłany jest w ciasteczku do użytkownika
// więc następnym razem przeglądarka przy kolejnuych odwiedzinach na go zwróci i wiemy ze to ta sama osoba

app.use(
	expressSession({
		secret: 'secret', //losowy długi string potrzebny do potwierdzenia prawdziwości sesji, przechowywany w aplikacji nie moze być udoępniany na zewnątrz

		resave: false, //czy sesje mają być zapisywane w session-storem zwykle daje się false ponieważ moze to powodować problemy jak równocześnie request robi dwukrotnie to sama osoba

		saveUninitialized: true, // wrzuca nie zainicjowaną sesje do session storem jeżeli sesja została utworzona ale nie zmodyfikiowana nazywana jest niezainicjalizowaną
	})
);

app.use(passport.initialize()); // passport będzie działał przy kazdym requescie

app.use(passport.session()); //umozliwia pasportowi uzywanie mechanizku sesji

//authuser to funkcja pozwalająca na autoryzację uzytkownika, zwraca zautoryzowanego uzytkownika np z bazy, authUser uzywana jest przez strategię do autoryzacji usera
const authUser = (user, password, done) => {
	//passport dodane do user dane z req.body.username i req.body.password
	console.log(` - authUser() username: ${user}, password: ${password} `);
	//user oraz password muszą być uzyte do odnalezienia uzytkownika w bazie danych
	//1. jezeli uzytkownik nie jest znaleziony lub jest złe hasło zwracamy done(null, false)
	//2. Gdy uzytkownik i hasło się zgadzają z rekordem w bazie zwracamy done (null, user)

	let authenticatedUser = {
		id: 5,
		username: 'user#00001',
		surname: 'Dadej',
	};

	return done(null, authenticatedUser);
};

// przekazujemy funkcję autoryzującą do lokalnej strategii
passport.use(
	new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
	},
	authUser)
);

passport.serializeUser((user, done) => {
	// funkcja otrzymuje zautoryzowanego user z authUser()

	console.log('- serializeUser(), user:', user);
	//wywołujemy done i passport zapisze id usera do rq.session.password.user
	//w ten sposób dane uzytkonika zapisane są w sesji czyli np{id: 5, name: "user#00001", surname: "Dadej"}
	//to id będzie uzyte przez deserializeUser() do pobrania pełnych danych uzytkownika

	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	//funkcja na podstawie przekazanego id pobiera pełne dane
	//uzytkownika np z bazy i zwraca je do done(), dzięki temu
	//trafia on do req.user i moze byc uzyty gdziekolwiek w apce

	console.log(' - deserializeUser with id:', id);
	const userDb = {
		id: 5,
		username: 'User#00001',
		surname: 'Dadej',
	};
	done(null, userDb);
});

//sprawdza czy zalogowany user, wtedy pozwala odwiedzić dany url
// jeśli nie zalogowany to redirect na główną stronę
// uzywana funkcja np do obsługi adresu /dashboard który jest tylko dla zalogowanych

const checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		//zwróci true jeśli zautoryzowany user czyli są dane w re.session.passport.user
		return next(); //jesli zautoryzowany i moze odwiedzić url
	}
	res.redirect('/'); // nie zautoryzowany user więc redirect na główną stronę
};

//funkcja sprawdzająca czy zalogowany uzytkownik, jesli tak i chce
//wejść na login czy register to trafi do dashboard

const checkLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}

	next();
};

let count = 0;
const printRequestData = (req, res, next) => {
	console.log('\nREQUEST num:' + count++ + 'date:' + new Date());
	console.log('req.body.username', req.body.username);
	console.log('req.body.password', req.body.password);
	console.log('req.session.passport:', req.session.passport);
	console.log('reg.user', req.user);
	console.log('req.session.id', req.session.id);
	console.log('req.session.cookie', req.session.cookie);
	next();
};

app.use(printRequestData);

const viewsPath = path.join(__dirname, 'views');
console.log('viewPath', viewsPath);

app.set('vievs', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/login', checkLoggedIn, (req, res) => {
	console.log('get /login');
	res.render('pages/login.ejs');
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/login',
	})
);

app.get('/dashboard', checkAuthenticated, (req, res) => {
	console.log('get /dashboard');
	res.render('pages/dashboard.ejs', {
		name: req.user.username,
	});
});

app.get('/logout', (req, res, next) => {
	req.logout(function (err) {
		console.log(' u User Logged Out!');
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});
app.post('/logout', (req, res, next) => {
	req.logout(function (err) {
		console.log(' u User Logged Out!');
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});

app.get('/', (req, res) => {
	res.render('pages/index.ejs', {
		name: 'unknown',
	});
});

app.listen(3010, () => {
	console.log('Server started at port 3010');
});
