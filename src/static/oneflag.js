// Живое обновление дашборда: одно SSE-соединение обновляет и таблицу, и журнал.
// Опроса сервера нет - изменения приходят сами.
(function () {
	const индикатор = document.getElementById('индикатор');
	const журнал = document.getElementById('журнал');
	const окружение = document.body.dataset['окружение'];
	const поток = new EventSource('/stream');

	поток.onopen = () => {
		индикатор.textContent = 'в эфире';
		индикатор.classList.add('живой');
	};

	поток.onerror = () => {
		индикатор.textContent = 'переподключение';
		индикатор.classList.remove('живой');
	};

	function записатьВЖурнал(событие) {
		const пусто = журнал.querySelector('.пусто');
		if (пусто) пусто.remove();

		const строка = document.createElement('li');
		const время = new Date().toLocaleTimeString('ru-RU');
		строка.textContent = `${время} · ${событие.type} · ${событие.data.флаг ?? ''} · ${событие.data.автор ?? ''}`;
		журнал.prepend(строка);

		while (журнал.children.length > 20) журнал.lastChild.remove();
	}

	function приИзменении(сообщение) {
		let конверт;
		try {
			конверт = JSON.parse(сообщение.data);
		} catch (e) {
			return;
		}

		записатьВЖурнал({ type: конверт.type, data: конверт.data || {} });

		// Чужое окружение попадает в журнал, но таблицу не трогает
		if ((конверт.data || {}).окружение !== окружение) return;

		fetch('/ui/flags?env=' + encodeURIComponent(окружение))
			.then(ответ => ответ.text())
			.then(разметка => {
				const таблица = document.getElementById('таблица-флагов');
				таблица.innerHTML = разметка;
				if (window.htmx) htmx.process(таблица);
			});
	}

	['com.oneflag.flag.changed', 'com.oneflag.flag.created', 'com.oneflag.flag.deleted']
		.forEach(тип => поток.addEventListener(тип, приИзменении));
})();
