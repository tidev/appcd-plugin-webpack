export function processStats(stats) {
	const assets = buildSortedAssets(stats.assets);
	const assetsSize = assets.reduce((total, asset) => {
		return total + asset.size;
	}, 0);
	const modules = buildSortedModules(filterInternalModules(stats.modules));
	const modulesSize = modules.reduce((total, module) => {
		return total + module.size;
	}, 0);
	const depModules = buildDepModules(modules);
	const depModulesSize = depModules.reduce((total, module) => {
		return total + module.size;
	}, 0);

	return {
		errors: stats.errors,
		warnings: stats.warnings,
		assets,
		assetsSize,
		modulesSize,
		depModules,
		depModulesSize
	};
}

function filterInternalModules(modules) {
	return modules.filter(module => module.name.indexOf('(webpack)') === -1);
}

function buildSortedAssets(assets) {
	let list = assets.slice();
	const max = assets.reduce(
		(acc, cur) => (cur.size.parsed > acc ? cur.size.parsed : acc),
		0
	);
	if (list.length) {
		list = assets.map(asset => {
			const size = asset.size.parsed;
			return {
				name: asset.name,
				size,
				ratio: size / max
			};
		});
		list.sort((a, b) => b.size - a.size);
	}

	return list;
}

function buildSortedModules(modules) {
	let list = modules.slice();
	if (list.length) {
		list = list.map(module => {
			const size = module.size.parsed;
			return {
				id: module.id,
				identifier: module.identifier,
				size
			};
		});
		list.sort((a, b) => b.size - a.size);
	}
	return list;
}

function buildDepModules(modules) {
	const deps = new Map();
	for (const module of modules) {
		const path = getModulePath(module.identifier);
		const pathParts = path.split('/node_modules/');
		if (pathParts.length === 2) {
			let name = pathParts[1];
			if (name.charAt(0) === '@') {
				// Scoped package
				name = name.substr(0, name.indexOf('/', name.indexOf('/') + 1));
			} else {
				name = name.substr(0, name.indexOf('/'));
			}
			let dep = deps.get(name);
			if (!dep) {
				dep = {
					name,
					size: 0
				};
				deps.set(name, dep);
			}
			dep.size += module.size;
		}
	}
	let list = Array.from(deps.values());
	list.sort((a, b) => b.size - a.size);
	if (list.length) {
		const max = list[0].size;
		for (const dep of list) {
			dep.ratio = dep.size / max;
		}
	}
	return list;
}

function getModulePath(identifier) {
	return identifier.replace(/.*!/, '').replace(/\\/g, '/');
}
