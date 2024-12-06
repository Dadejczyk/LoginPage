const usersRoles = [
	{
		role: 'admin',
		allows: [
			{ resource: '/admin/users', permissions: '*' },
			{ resource: '/admin/users/add', permissions: '*' },
			{ resource: '/admin/users/edit', permissions: '*' },
			{ resource: '/admin/users/edit/:id', permissions: '*' },
		],
	},
	{
		role: 'user',
		allows: [{ resource: '/dashboard', permissions: ['post', 'get'] }],
	},
	{
		role: 'guest',
		allows: [],
	},
];

const permissions = {
	usersRoles: usersRoles,
	addRoleParents: function (targetRole, sourceRole) {
		//kopiuje role z source do target czyli np admin ma dodatkowo role usera aby się nie powtarzać a z urlami
		const targetData = this.usersRoles.find((v) => v.role === targetRole);
		const sourceData = this.usersRoles.find((v) => v.role === sourceRole);

		targetData.allows = targetData.allows.concat(sourceData.allows);
	},

	isResourceAllowedForUser: function (userRole, resource, method) {
		//spraawdza czy user o okreslonej roli moze miec dostęp do resource
		//zwraca false jesli nie ma dostepu, true jesli ma dostep

		const roleData = this.usersRoles.find((v) => v.role === userRole);

		if (!roleData) return false; //brak dosępu bo nie ma takiej roli obsługiwanej na serverze

		const resourceData = roleData.allows.find((v) => v.resource === resource);

		if (!resourceData) return false; //osoba o tej roli nie ma info o tym adresie wiec nie ma dostępu

		if (!resourceData.permissions) return false;

		if (!Array.isArray(resourceData.permissions)) {
			if (resourceData.permissions === '*') return true; //dostep do wszystkich metod
			if (resourceData.permissions === method) return true;
		} else {
			//tablica
			if (resourceData.permissions.find((v) => v === '*')) return true;
			if (resourceData.permissions.find((v) => v === method)) return true;
		}
		return false; //brak dostępu
	},
};

permissions.addRoleParents('admin', 'user');
// console.log(JSON.stringify(permissions.usersRoles, null, 4));

console.log(permissions.isResourceAllowedForUser('admin', '/dashboard', 'get'));
console.log(permissions.isResourceAllowedForUser('admin', '/dashboard', 'delete'));
console.log(permissions.isResourceAllowedForUser('admin', '/admin/users', 'get'));
console.log(permissions.isResourceAllowedForUser('admin', '/api/data/10', 'get'));
console.log(permissions.isResourceAllowedForUser('user', '/admin/users', 'get'));
console.log(permissions.isResourceAllowedForUser('user', '/dashboard', 'get'));
console.log(permissions.isResourceAllowedForUser('user', '/api/user/1', 'get'));
console.log(permissions.isResourceAllowedForUser('gest', '/dashboard', 'get'));

export { permissions };
