if (typeof Array.prototype.getUnique != 'undefined') {
	console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}
Array.prototype.getUnique = function () {
	var u = {},
	a = [];
	for (var i = 0, l = this.length; i < l; i += 1) {
		if (u.hasOwnProperty(this[i])) {
			continue;
		}
		a.push(this[i]);
		u[this[i]] = 1;
	}
	return a;
}
Object.defineProperty(Array.prototype, "getUnique", {
	enumerable : false
});
