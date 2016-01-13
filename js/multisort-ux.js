/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function augment(target, source) {
	for (var i in source) {
		if (source.hasOwnProperty(i)) {
			target[i] = source[i];
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

function getColors(length, options) {
	var colors = [],
	start = options.hueOffset,
	step = Math.round(options.maxHueShift / length),
	i = 0,
	z,
	max,
	sum;

	for (; i < length; i += 1) {
		colors.push(hsvToRgb(start + (i * step), options.saturation, options.brightness).join(','));
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
			_1 = _1 || (parseInt(a[_0[_i][0]], 10) - parseInt(b[_0[_i][0]], 10)) * _2;
		}
		return _1;
	};
}

function template(html, data) {
	return html.replace(/{{([^{}]*)}}/g, function (match, p1, p2, p3, offset, string) {
		return data[p1] === null ? '' : data[p1];
	});
}

function onSelectionChange(boxes, options) {
	options.selected = [];
	for (var i = 0, l = boxes.length; i < l; i += 1) {
		(function () {
			if (this.checked) {
				options.selected.push(this.value);
			}
		}).call(boxes[i]);
	}

	options.table.dispatchEvent(new CustomEvent('selection', {
			detail : {
				data : options.data,
				selected : options.selected
			}
		}));
}

function registerSelectChangeHandlers(options) {
	var boxes = options.table.querySelectorAll('tbody tr td:first-child > input[type="checkbox"]');

	for (var i = 0, l = boxes.length; i < l; i += 1) {
		boxes[i].addEventListener('change', function () {
			if (options.selected.length === options.limit) {
				this.checked = false;
			}
			onSelectionChange(boxes, options);
		});
	}

	options.table.querySelector('thead tr td:first-child > input[type="checkbox"]').addEventListener('change', function (e) {
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
					if (!this.disabled && i < options.limit) {
						this.checked = true;
						c += 1;
					}
				}).call(boxes[i]);
			}
		}
		onSelectionChange(boxes, options);
	});

	onSelectionChange(boxes, options);
}

function renderTableHead(options) {
	var i = 0, cols = options.table.querySelectorAll('thead tr:last-child td:not(:first-child)'),
	l = cols.length,
	html = '',
	letters = getLetters();
	
	options.colors = getColors(l, options);
	
	for (; i < l; i += 1) {
		html += ['<td style="background-color:rgb(', options.colors[i], ');">', letters[i], '<i></i><span class="col-slot"><b></b></span></td>'].join('');
		cols[i].innerHTML += '<span class="col-slot"><b></b></span>';
	}
	options.table.querySelector('thead tr:first-child').innerHTML += html;
	mapPrioritiesToColumns(options);
}

function mapPrioritiesToColumns(options) {
	var p = options.table.querySelectorAll('thead tr:first-child td:not(:first-child)'),
		l = options.sort.length,
		i = 0, 
		col;
	for (; i < l; i += 1) {
		col = options.table.querySelector(['[data-col="', options.sort[i][0], '"]'].join(''));
		p[i].querySelector('i').innerHTML += col.textContent;
		
		if (options.sort[i][1] !== '<') {
			p[i].classList.add('asc');
			col.classList.add('asc');
			col.querySelector('.col-slot b').style.borderBottomColor = ['rgb(', options.colors[i], ')'].join('');
			p[i].querySelector('.col-slot b').style.borderBottomColor = '#777';
		} else {
			p[i].classList.remove('asc');
			col.classList.remove('asc');
			col.querySelector('.col-slot b').style.borderTopColor = ['rgb(', options.colors[i], ')'].join('');
			p[i].querySelector('.col-slot b').style.borderTopColor = '#777';
		}
		
	}
}

function renderTableBody(options) {
	var html = '',
	i = 0,
	l = options.data.length;
	options.table.querySelector('tbody').innerHTML = '';
	for (; i < l; i += 1) {
		html += template(options.table.querySelector('caption > textarea').value,
			augment({
				checked : i < options.limit ? 'checked' : ''
			}, options.data[i]));
	}
	options.table.querySelector('tbody').innerHTML = html;
	registerSelectChangeHandlers(options);
}

function renderTable(options) {
	var limiter,
	numColumns;

	options = augment({
			table : 'table',
			data : [],
			limit : 100,
			sort : [],
			selected : 0,
			hueOffset : 30,
			maxHueShift : 120,
			saturation : 90,
			brightness : 100
		}, options);

	options.table = document.querySelector(options.table);

	renderTableHead(options);

	limiter = options.table.querySelector('caption .select-limit-controls > input');

	limiter.value = options.limit;

	limiter.addEventListener('change', function (e) {
		options.limit = parseInt(e.target.value, 10);
	});

	options.table.querySelector('caption .select-limit-controls > .increment').addEventListener('click', function () {
		options.limit += 1;
		limiter.value = options.limit;
	});

	options.table.querySelector('caption .select-limit-controls > .decrement').addEventListener('click', function () {
		options.limit -= 1;
		limiter.value = options.limit;
	});

	options.data.sort(sortByMultiple.apply(null, options.sort));

	options.table.addEventListener('selection', function (e) {
		options.table.querySelector('caption .counters .total').textContent = e.detail.data.length;
		options.table.querySelector('caption .counters .selected').textContent = e.detail.selected.length;
	});

	renderTableBody(options);
}