/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getEvent(type, init) {
	var event = null;
	try {
		if (init) {
			event = new CustomEvent(type, init);
		} else {
			event = new MouseEvent(type);
		}
	} catch (e) {
		if (init && init.detail) {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(type, false, false, init.detail);
		} else {
			event = document.createEvent('MouseEvent');
			event.initEvent(type, 0, 0);
		}
	}
	return event;
}

function augment(target, source) {
	for (var i in source) {
		if (source.hasOwnProperty(i)) {
			if (typeof source[i] === 'object') {
				target[i] = JSON.parse(JSON.stringify(source[i]));
			} else {
				target[i] = source[i];
			}
		}
	}
	return target;
}

function getLetters(upper) {
	var i = 97,
	l = 122,
	letters = [];

	if (upper) {
		i = 65;
		l = 90;
	}

	for (; i <= l; i += 1) {
		letters.push(String.fromCharCode(i))
	}
	return letters;
}

function hsvToRgb(h, s, v) {
	var r,
	g,
	b,
	i,
	f,
	p,
	q,
	t;

	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));

	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;

	if (s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch (i) {
	case 0:
		r = v;
		g = t;
		b = p;
		break;

	case 1:
		r = q;
		g = v;
		b = p;
		break;

	case 2:
		r = p;
		g = v;
		b = t;
		break;

	case 3:
		r = p;
		g = q;
		b = v;
		break;

	case 4:
		r = t;
		g = p;
		b = v;
		break;

	default: // case 5:
		r = v;
		g = p;
		b = q;
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getColors(length) {
	var colors = [],
	start = config.hueOffset,
	step = Math.round(config.maxHueShift / length),
	i = 0,
	z,
	max,
	sum;

	for (; i < length; i += 1) {
		colors.push(hsvToRgb(start + (i * step), config.saturation, config.brightness).join(','));
	}
	return colors;
}

function sortByMultiple() {
	var _0 = arguments;
	return function (a, b) {
		var _1 = 0,
		_2 = 1,
		_i = 0,
		_l = _0.length;
		for (; _i < _l; _i += 1) {
			if (_0[_i][1] === '<') {
				_2 = -1;
			} else {
				_2 = 1;
			}
			if (!isNaN(parseInt(a[_0[_i][0]], 10)) && !isNaN(parseInt(a[_0[_i][0]], 10))) {
				_1 = _1 || (parseInt(a[_0[_i][0]], 10) - parseInt(b[_0[_i][0]], 10)) * _2;
			} else {
				_1 = _1 || (a[_0[_i][0]] > b[_0[_i][0]] ? 1 : (a[_0[_i][0]] === b[_0[_i][0]] ? 0 : -1)) * _2;
			}
		}
		return _1;
	};
}

function template(html, data) {
	return html.replace(/{{([^{}]*)}}/g, function (match, p1, p2, p3, offset, string) {
		return data[p1] === null ? '' : data[p1];
	});
}

function onSelectionChange(boxes) {
	config.selected = [];
	for (var i = 0, l = boxes.length; i < l; i += 1) {
		(function () {
			if (this.checked) {
				config.selected.push(this.value);
			}
		}).call(boxes[i]);
	}

	var state = augment({}, config);
	state.table = config.selector;
	config.table.dispatchEvent(getEvent('selection', {
			detail : {
				data : state.data,
				selected : state.selected,
				state : state
			}
		}));
}

function updateSelectionLength() {
	var i,
	l,
	allBox = config.table.querySelector('thead input[type="checkbox"]'),
	boxes = config.table.querySelectorAll('tbody input[type="checkbox"]'),
	checkedCount = getNumChecked(boxes);
	if (checkedCount > config.range) {
		for (i = boxes.length - 1; i > -1; i -= 1) {
			if (boxes[i].checked) {
				boxes[i].checked = false;
				if (getNumChecked(boxes) === config.range) {
					break;
				}
			}
		}
	}
	if (getNumChecked(boxes) >= config.range) {
		allBox.checked = true;
	} else {
		allBox.checked = false;
	}

	onSelectionChange(boxes);
}

function getNumChecked(boxes) {
	return (Array.prototype.map.call(boxes, function (c) {
			return c.checked ? 1 : 0;
		})).reduce(function (p, c) {
		return p + c;
	});
}

function registerSelectionChangeHandlers() {
	var boxes = config.table.querySelectorAll('tbody tr td:first-child > input[type="checkbox"]');

	boxes.listener = function () {
		if (getNumChecked(boxes) < config.range) {
			config.table.querySelector('thead input[type="checkbox"]').checked = false;
		} else {
			config.table.querySelector('thead input[type="checkbox"]').checked = true;
		}
		onSelectionChange(boxes);
	};
	Array.prototype.map.call(boxes, function (o) {
		if (!o.listener || o.listener !== boxes.listener) {
			o.addEventListener('change', boxes.listener);
			o.listener = boxes.listener;
		}
	});

	config.table.querySelector('thead tr td:first-child > input[type="checkbox"]').addEventListener('change', function (e) {
		if (!e.target.checked) {
			for (var i = 0, l = boxes.length; i < l; i += 1) {
				(function () {
					if (!this.disabled) {
						this.checked = false;
					}
				}).call(boxes[i]);
			}
		} else {
			var c = 0,
			i = 0,
			l = boxes.length;
			for (; i < l; i += 1) {
				(function () {
					if (!this.disabled && i < config.range) {
						this.checked = true;
						c += 1;
					}
				}).call(boxes[i]);
			}
		}
		onSelectionChange(boxes);
	});
}

function sortTable() {
	config.data.sort(sortByMultiple.apply(null, config.sortPattern));
	renderTableHeader();
	renderTableBody();
	config.table.dispatchEvent(getEvent('sort', {
			detail : 'sorted'
		}));
	registerSelectionChangeHandlers();
	registerMouseClickHandlers();
	updateSelectionLength();
}

function registerMouseClickHandlers() {
	var vsort = config.table.querySelectorAll('.xsort-v > b'),
	hsort = config.table.querySelectorAll('.xsort-h > b'),
	off = config.table.querySelectorAll('.xsort-off > b'),
	on = config.table.querySelectorAll('.xsort-on > b');

	vsort.listener = function (e) {
		e.stopPropagation();
		var col = e.target.parentNode.parentNode,
		ord,
		name = col.getAttribute('data-col');
		if (e.target.parentNode.classList.contains('asc')) {
			ord = '<';
		} else {
			ord = '>';
		}
		config.sortPattern = config.sortPattern.map(function (o, i) {
				if (o[0] === name) {
					o[1] = ord;
				}
				return o;
			});
		sortTable();
	};
	Array.prototype.map.call(vsort, function (o) {
		if (!o.listener || o.listener !== vsort.listener) {
			o.addEventListener('click', vsort.listener);
		}
		o.listener = vsort.listener;
	});
	hsort.listener = function (e) {
		e.stopPropagation();
		var col = e.target.parentNode.parentNode,
		priority = parseInt(col.getAttribute('data-priority')),
		a;
		if (priority > -1) {
			if (e.target.parentNode.classList.contains('inc') && priority > 0) {
				a = config.sortPattern[priority - 1];
				config.sortPattern[priority - 1] = config.sortPattern[priority];
				config.sortPattern[priority] = a;
				sortTable();
			} else if (e.target.parentNode.classList.contains('dec') && priority < config.sortPattern.length - 1) {
				a = config.sortPattern[priority];
				config.sortPattern[priority] = config.sortPattern[priority + 1];
				config.sortPattern[priority + 1] = a;
				sortTable();
			}
		}
	};
	Array.prototype.map.call(hsort, function (o) {
		if (!o.listener || o.listener !== hsort.listener) {
			o.addEventListener('click', hsort.listener);
		}
		o.listener = hsort.listener;
	});
	off.listener = function (e) {
		e.stopPropagation();
		var col = e.target.parentNode.parentNode;
		p = parseInt(col.getAttribute('data-priority'));
		if (p > -1) {
			config.sortPattern.splice(p, 1);
			sortTable();
		}
	};
	Array.prototype.map.call(off, function (o) {
		if (!o.listener || o.listener !== off.listener) {
			o.addEventListener('click', off.listener);
		}
		o.listener = off.listener;
	});
	on.listener = function (e) {
		e.stopPropagation();
		var col = e.target.parentNode.parentNode,
		a = config.sortPattern,
		c = [];
		for (var i = 0, l = a.length; i < l; i += 1) {
			c.push(a[i][0]);
		}
		p = c.indexOf(col.getAttribute('data-col'));
		if (p < 0) {
			config.sortPattern.push([col.getAttribute('data-col'), '<']);
			sortTable();
		}
	};
	Array.prototype.map.call(on, function (o) {
		if (!o.listener || o.listener !== on.listener) {
			o.addEventListener('click', on.listener);
		}
		o.listener = on.listener;
	});
}

function registerSelectionRangeHandlers() {
	var rangeInput = config.table.querySelector('caption .select-range-controls > input');

	rangeInput.value = config.range;

	rangeInput.addEventListener('change', function (e) {
		config.range = parseInt(e.target.value, 10);
		updateSelectionLength();
	});

	config.table.querySelector('caption .select-range-controls > .increment').addEventListener('click', function () {
		config.range += 1;
		if (config.range > config.data.length) {
			return config.range = config.data.length;
		}
		rangeInput.value = config.range;
		updateSelectionLength();
	});

	config.table.querySelector('caption .select-range-controls > .decrement').addEventListener('click', function () {
		config.range -= 1;
		if (config.range < 0) {
			return config.range = 0;
		}
		rangeInput.value = config.range;
		updateSelectionLength();
	});
}

function renderTableHeader() {
	var th = config.table.querySelector('thead'),
	cols = config.table.querySelectorAll('thead tr:last-child td:not(:first-child)'),
	letters = getLetters(),
	html = '',
	crow = '<tr class="priority ctrl"><td></td>',
	a = config.sortPattern,
	c = [],
	i = 0,
	l = config.sortPattern.length,
	n = 0,
	z = cols.length;

	Array.prototype.map.call(th.querySelectorAll('.priority'), function (o) {
		return th.removeChild(o);
	});

	config.colors = getColors(l);

	for (var i = 0, l = a.length; i < l; i += 1) {
		c.push(a[i][0]);
	}

	for (; n < z; n += 1) {
		crow += [
			'<td data-col="',
			cols[n].getAttribute('data-col'),
			'"data-priority=',
			c.indexOf(cols[n].getAttribute('data-col')),
			'>',
			'<div class="xsort-h dec"><b></b></div>',
			'<div class="xsort-on"><b></b></div>',
			'<div class="xsort-off"><b></b></div>',
			'<div class="xsort-h inc"><b></b></div>',
			'</td>'
		].join('');
	}

	for (i = 0; i < l; i += 1) {
		html += '<tr class="priority">';
		html += ['<td style="background-color:rgb(', config.colors[i], ')">', letters[i], '</td>'].join('');

		for (n = 0; n < z; n += 1) {
			if (cols[n].getAttribute('data-col') === config.sortPattern[i][0]) {
				html += [
					'<td data-col="',
					config.sortPattern[i][0],
					'"><div class="xsort-v',
					(config.sortPattern[i][1] !== '<' ? ' asc' : ''),
					'"><b style="border-',
					(config.sortPattern[i][1] !== '<' ? 'bottom' : 'top'),
					'-color: rgb(',
					config.colors[i],
					');"></b></div></td>'
				].join('');
			} else {
				html += '<td></td>';
			}
		}
		html += '</tr>';
	}
	th.innerHTML = html + crow + th.innerHTML;

}

function renderTableBody() {
	var html = '',
	i = 0,
	l = config.data.length;
	config.table.querySelector('tbody').innerHTML = '';
	for (; i < l; i += 1) {
		html += template(config.table.querySelector('caption > textarea').value,
			augment({
				checked : i < config.range ? 'checked' : ''
			}, config.data[i]));
	}
	config.table.querySelector('tbody').innerHTML = html;
}

var config, defaults = {
	table : 'table.xsort',
	data : [],
	range : -1,
	sortPattern : [],
	selected : 0,
	hueOffset : 30,
	maxHueShift : 120,
	saturation : 90,
	brightness : 100
};

function renderTable(options) {
	config = augment(augment({}, defaults), options);

	if (config.range < 0 || config.range > config.data.length) {
		config.range = config.data.length;
	}
	config.selector = config.table;
	config.table = document.querySelector(config.table);


	config.data.sort(sortByMultiple.apply(null, config.sortPattern));

	config.table.querySelector('caption .counters .total').textContent = config.data.length;
	config.table.querySelector('caption .counters .selected').textContent = config.range;
	config.table.addEventListener('selection', function (e) {
		config.table.querySelector('caption .counters .total').textContent = e.detail.data.length;
		config.table.querySelector('caption .counters .selected').textContent = e.detail.selected.length;
	});

	renderTableHeader();
	renderTableBody();

	registerSelectionRangeHandlers();
	registerMouseClickHandlers();
	registerSelectionChangeHandlers();

	config.table.dispatchEvent(getEvent('render', {
			detail : 'rendered'
		}));
}
