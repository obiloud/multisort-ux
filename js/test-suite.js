function getDataMatrix(r, c) {
	var i = 0,
	l,
	b,
	m = [],
	p,
	w = 0,
	log = 0;

	b = Array.apply(null, Array(c)).map(Number.prototype.valueOf, 0);
	l = r;
	p = Math.round(l / c);

	if (log)
		console.log('data matrics for (', b.length, ') column table');

	for (; i < l; i += 1) {
		if (i % p) {
			w += 1;
			if (w === b.length) {
				w = 0;
			}
			b[w] -= 1;
		} else {
			b[w] += 1;
		}
		b[w] = Math.abs(b[w]);
		if (log)
			console.log(b);
		m.push(b.slice(0));
	}

	return m;
}

function formatData(d) {
	var data = [],
	a = getLetters(),
	c,
	i = 0,
	l = d.length,
	o,
	r,
	t;

	for (; i < l; i += 1) {
		o = {};
		o.id = i + 1;
		r = d[i];
		if (!c)
			c = r.length;
		for (t = 0; t < c; t += 1) {
			o[a[t]] = r[t];
		}
		data.push(o);
	}
	return data;
}

function FindAllLetterCasePermutations(s) {
	var sp = s.split(""),
	buffer = [];
	for (var i = 0, l = 1 << s.length; i < l; i++) {
		for (var j = i, k = 0; j; j >>= 1, k++) {
			sp[k] = (j & 1) ? sp[k].toUpperCase() : sp[k].toLowerCase();
		}
		buffer.push(sp.join(""));
	}
	return buffer;
}

function FindAllPermutations(str, index, buffer) {
	if (typeof str == "string")
		str = str.split("");
	if (typeof index == "undefined")
		index = 0;
	if (typeof buffer == "undefined")
		buffer = [];
	if (index >= str.length)
		return buffer;
	for (var i = index; i < str.length; i++)
		buffer.push(ToggleLetters(str, index, i));
	return FindAllPermutations(str, index + 1, buffer);
}

function ToggleLetters(str, index1, index2) {
	if (index1 != index2) {
		var temp = str[index1];
		str[index1] = str[index2];
		str[index2] = temp;
	}
	return str.join("");
}

function getPattern(l, print) {
	var c,
	buffer = [],
	pattern = {};
	c = FindAllPermutations(getLetters().splice(0, l).join(''));
	for (var i = 0, l = c.length; i < l; i += 1) {
		buffer = buffer.concat(FindAllLetterCasePermutations(c[i]));
	}
	buffer = buffer.getUnique();

	(function (p) {
		if (p) {
			for (var i = 0, l = buffer.length; i < l; i += 1) {
				console.log('test case:', buffer[i]);
			}
		}
	})(print);

	buffer.map(function (s) {
		var r = s.split('');
		pattern[s] = [];
		for (var i = 0, l = r.length; i < l; i += 1) {
			pattern[s].push([r[i].toLowerCase(), r[i] === r[i].toLowerCase() ? '<' : '>']);
		}
	});
	pattern.expected = buffer.length;
	return pattern;
}
