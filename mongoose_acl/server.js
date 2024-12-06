// npm i -y
// npm i express express-session ejs passport passport-local mongodb mongoose
// w package.json type jako  module

import express from 'express';
import { passport } from './utility/auth.js';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { authRole } from './utility/aclauth.js';
import { UsersController } from './controllers/UsersController.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const usersController = new UsersController();
const app = express();

app.use(express.urlencoded({ extended: false })); // sparsuje dane przesłąne z POST

app.use(
	expressSession({
		secret: 'secret',
		resave: false,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());

//sprawdza czy uzytkownik jest zalogowany i czy moze skorzystać z danego adresu
const checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		//czy zalogowany
		return next(); //jesli tak to mozee zobaczyć adres np dashboard
	}

	res.redirect('/'); //nie zalogowany nie moze zobaczyc dashboard, wraca na główną  stronę
};

//funkcja sprawdzająca czy zalogowany uzytkownik, jeśli tak i chce wejśc na login czy register to trafi do dashboard
const checkLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}
	next();
};

const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

//rejestracja usera, checkLoggedIn() sprawdza czy zalogowany to wtedy redirect na dashboard
app.get('/register', checkLoggedIn, (req, res) => {
	console.log('/register');
	res.render('pages/register.ejs', {
		user: req.user,
	});
});

app.post(
	'/register',
	passport.authenticate('local-signup', {
		successRedirect: '/login?reg=succes',
		failureRedirect: '/register?reg=failure',
	})
);
app.get('/login', checkLoggedIn, (req, res) => {
	console.log('/login');
	res.render('pages/login.ejs', {
		user: req.user,
	});
});
app.post(
	'/login',
	passport.authenticate('local-login', {
		successRedirect: '/dashboard',
		failureRedirect: '/login?log=failure',
	})
);
app.get('/dashboard', checkAuthenticated, (req, res) => {
	console.log('/dashboard');
	res.render('pages/dashboard.ejs', {
		user: req.user,
	});
});

app.get('/admin/users', authRole, async (req, res) => {
	console.log('/admin/users');

	const users = await usersController.getAll();
	res.render('pages/admin/users.ejs', {
		user: req.user,
		users: users,
	});
});

app.get('/admin/users/add', authRole, async (req, res) => {
	console.log('/admin/users/add');

	res.render('pages/admin/users_add.ejs', {
		user: req.user,
	});
});

app.post('/admin/users/add', authRole, async (req, res) => {
	console.log('POST /admin/users/add');
	console.log('req.body:', req.body);

	const userDb = await usersController.createUser(req.body);
	res.redirect('/admin/users');
});

app.get('/admin/users/edit/:id', authRole, async (req, res) => {
	console.log('admin/users/edit/:id');
	const { id } = req.params;

	if (!id) return res.redirect('/admin/users');

	const userToEdit = await usersController.getById(id);
	res.render('pages/admin/users_edit.ejs', {
		user: req.user, //administrator
		userToEdit: userToEdit,
	});
});

app.post('/admin/users/edit/:id', authRole, async (req, res) => {
	console.log('POST /admin/users/edit/:id');
	const { id } = req.params;

	if (!id) return res.redirect('/admin/users');

	const userToEdit = await usersController.updateById(id, req.body);
	res.redirect('/admin/users');
});

app.get('/logout', (req, res) => {
	req.logout(function (err) {
		console.log('user Logged out');
		if (err) return next(err);

		res.redirect('/');
	});
});

app.get('/logout', (req, res) => {
	req.logout(function (err) {
		console.log('user Logged out');
		if (err) return next(err);

		res.redirect('/');
	});
});

app.get('/', (req, res) => {
	res.render('pages/index.ejs', {
		user: req.user,
	});
});
app.listen(3010, () => {
	console.log('Server starrted at port 3010');
});
