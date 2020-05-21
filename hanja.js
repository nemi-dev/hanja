function el(css, children) {
	let m = /^(?<name>[0-9A-Za-z\-]+)?(?<idHash>\#[^\.]+)?(?<classJoin>(?:\.[^\.]+)*)$/.exec(css);
	let { name = 'div', idHash, classJoin } = m.groups;
	let e = document.createElement(name);
	if (idHash) e.setAttribute('id', idHash.slice(1));
	if (classJoin) {
		let classList = classJoin.slice(1).split('.');
		e.classList.add(...classList);
	}
	if (children) e.append(...children);
	return e;
}

function localFetch(target) {
	let x = new XMLHttpRequest();
	return new Promise((a, b) => {
		x.responseType = 'text';
		x.onreadystatechange = function() {
			if (x.readyState == XMLHttpRequest.DONE) {
				if (x.status >= 400) {
					b();
				} else {
					a(x.responseText);
				}
			}
		}
		x.onerror = b;
		x.open('GET', target);
		x.send();
	});
}

function word(s, c) {
	s = s.trim();
	let w = el('div.word', null);
	let t = [];
	for (let j = 0; j < s.length; j++) {
		let code = s[j].charCodeAt(0);
		if ((code >= 0x3400 && code <= 0x9fff) || (code >= 0xf900 && code <= 0xfaff)) {
			if (t.length > 0) {
				w.append(el('span', [t.join('').trim()]));
				t = [];
			}
			let i = el('i', [s[j]]);
			i.setAttribute('rt', c[s[j]] || '');
			w.append(i);
		} else {
			t.push(s[j]);
		}
	}
	if (t.length > 0) {
		w.append(el('span', [t.join('').trim()]));
	}
	return w;
}

(function(){
	
	let title = location.search.slice(1);
	
	document.title = decodeURIComponent(title);
	

	let v = [];
	let realInedxItem = [];

	Promise.all([
		localFetch('source/'+title+'.txt'),
		localFetch('source/'+title+'-음.txt').then(t=>{
			const c = {};
			t.trim().split('\n').forEach(v=>{
				c[v[0]] = v.slice(1);
			});
			return c;
		})
	]).then(([d, c])=>{
		d.trim().split('\n').forEach((line, index) => {
			let [a, b] = line.split(':');
			let row = el('div#'+(index + 1)+'.row', [
				word(a, c),
				el('div.description', [b])
			]);

			let indexAnchor = el('a', [
				el('li', [a])
			]);
			indexAnchor.href = '#'+(index + 1);
			
			v.push(row);
			realInedxItem.push(indexAnchor);
		});
		document.getElementsByTagName('main')[0].append(...v);
		document.getElementsByTagName('ol')[0].append(...realInedxItem);

		document.addEventListener('click', function(e) {
			if (e.target.tagName == 'I') {
				window.open(`https://www.google.com/search?query=${e.target.textContent}`, '_blank')
			}
		}, {capture : true});
	
		document.addEventListener('dblclick', function(e) {
			e.preventDefault();
			let s = window.getSelection();
			if (s.type != 'None') s.collapseToStart();
			for (const l of e.composedPath()) {
				if (l == document) break;
				if (l.classList.contains('row')) {
					let q = l.querySelector('.word').textContent.replace(/[^\u3400-\u9FFF\uF900-\uFAFF]+/ug, ' ');
					window.open(`https://www.google.com/search?query=${q}`, '_blank')
					break;
				}
			}
		}, {capture : true});
	
		let realIndex = document.getElementById('real-index');
	
		document.getElementById('button-nav').addEventListener('click', function(e) {
			if (realIndex.classList.contains('hidden')) {
				realIndex.classList.remove('hidden');
			} else {
				realIndex.classList.add('hidden');
			}
		});
	}).then(_=>{
		if (location.hash) {
			let target = document.getElementById(location.hash.slice(1));
			if (target) {
				window.scrollTo(null, target.getBoundingClientRect().top);
			}
		}
	}).catch(e=>{
		document.getElementsByTagName('main')[0].append(
			el('h1', ['오류!']),
			el('p', ['해당 주제를 찾을 수 없습니다.'])
		)
	});
	
	
	

})();
