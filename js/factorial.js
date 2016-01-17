var factorial = (function () {
	var f = [];
	function factorial(n) {
		if (n == 0 || n == 1) {
			return 1;
		}
		if (f[n] > 0) {
			return f[n];
		}
		return f[n] = factorial(n - 1) * n;
	}
	return function (n) {
		if (typeof f[n] !== 'undefined') {
			return f[n];
		} else {
			return factorial(n);
		}
	};
})();
