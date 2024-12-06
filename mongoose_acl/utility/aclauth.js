import { permissions } from './permissions.js';
function getGuestDefaultUser() {
	return {
		role: 'user',
	};
}

function authRole(req, res, next) {
	/*
        req.passport.session {user: "jinwefaiiamfioa"} albo undefined
        req.user: {
            _id: "fsafqrrf23r1",
            password: "145rj12h4512u",
            email: dadej@gakfaj.com,
            role: "user",
            creted: "...."
        }
    */
	console.log('authRole() - middleweare');
	const resource = req.route.path; // dashboard
	const method = req.method.toLowerCase();
	console.log('resource: ', resource, 'method: ', method);

	if (!req.user) {
		//jeśli jest nie zalogowany to passport nie wstawił danych usera i nie ma role, tworzymy guest
		req.user = getGuestDefaultUser();

		// return res.redirect("/?msg=forbidden-access")
	}

	console.log('req.user', req.user);

	if (permissions.isResourceAllowedForUser(req.user.role, resource, method)) {
		//true ma dostęp
		return next();
	} else {
		//nie ma dostępu
		res.status(401);
		return res.send('Access forbidden');
	}
	return next();
}

export { authRole };
