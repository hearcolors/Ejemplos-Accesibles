
function InitPxVideo(options) {

	"use strict";

	// Utilidades para códigos de tiempo del subtítulo
	function video_timecode_min(tc) {
		var tcpair = [];
		tcpair = tc.split(' --> ');
		return videosub_tcsecs(tcpair[0]);
	}

	function video_timecode_max(tc) {
		var tcpair = [];
		tcpair = tc.split(' --> ');
		return videosub_tcsecs(tcpair[1]);
	}

	function videosub_tcsecs(tc) {
		if (tc === null || tc === undefined) {
			return 0;
		}
		else {
			var tc1 = [],
				tc2 = [],
				seconds;
			tc1 = tc.split(',');
			tc2 = tc1[0].split(':');
			seconds = Math.floor(tc2[0]*60*60) + Math.floor(tc2[1]*60) + Math.floor(tc2[2]);
			return seconds;
		}
	}

	// Para ver subtitulos "manuales", ajuste la posición del subtítulo cuando el tiempo de juego ha cambiado (a tavés de rebobinado, click en barra de progreso, etc) 
	function adjustManualCaptions(obj) {
		obj.subcount = 0;
		while (video_timecode_max(obj.captions[obj.subcount][0]) < obj.movie.currentTime.toFixed(1)) {
			obj.subcount++;
			if (obj.subcount > obj.captions.length-1) {
				obj.subcount = obj.captions.length-1;
				break;
			}
		}
	}

	// Vea los subtitulos y el botón (para la inicialización)
	function showCaptionContainerAndButton(obj) {
		obj.captionsBtnContainer.className = "px-video-captions-btn-container pull-left show";
		if (obj.isCaptionDefault) {
			obj.captionsContainer.className = "px-video-captions pull-left show";
			obj.captionsBtn.setAttribute("checked", "checked");
		}
	}

	// Desafortunadamente debido al apoyo disperso, se requiere sniffing en el navegador
	function browserSniff() {
		var nVer = navigator.appVersion,
			nAgt = navigator.userAgent,
			browserName = navigator.appName,
			fullVersion = ''+parseFloat(navigator.appVersion),
			majorVersion = parseInt(navigator.appVersion,10),
			nameOffset,
			verOffset,
			ix;

		// MSIE 11
		if ((navigator.appVersion.indexOf("Windows NT") !== -1) && (navigator.appVersion.indexOf("rv:11") !== -1)) {
			browserName = "IE";
			fullVersion = "11;";
		}
		// MSIE
		else if ((verOffset=nAgt.indexOf("MSIE")) !== -1) {
			browserName = "IE";
			fullVersion = nAgt.substring(verOffset+5);
		}
		// Chrome
		else if ((verOffset=nAgt.indexOf("Chrome")) !== -1) {
			browserName = "Chrome";
			fullVersion = nAgt.substring(verOffset+7);
		}
		// Safari
		else if ((verOffset=nAgt.indexOf("Safari")) !== -1) {
			browserName = "Safari";
			fullVersion = nAgt.substring(verOffset+7);
			if ((verOffset=nAgt.indexOf("Version")) !== -1) {
				fullVersion = nAgt.substring(verOffset+8);
			}
		}
		// Firefox
		else if ((verOffset=nAgt.indexOf("Firefox")) !== -1) {
			browserName = "Firefox";
			fullVersion = nAgt.substring(verOffset+8);
		}
		// En la mayoria de los demás navegadores nombre/versión se encuentra al final de userAgent
		else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < (verOffset=nAgt.lastIndexOf('/')) ) {
			browserName = nAgt.substring(nameOffset,verOffset);
			fullVersion = nAgt.substring(verOffset+1);
			if (browserName.toLowerCase()==browserName.toUpperCase()) {
				browserName = navigator.appName;
			}
		}
		// Recorte la cadena Fullversión en coma/espacio si está presente
		if ((ix=fullVersion.indexOf(";")) !== -1) {
			fullVersion=fullVersion.substring(0,ix);
		}
		if ((ix=fullVersion.indexOf(" ")) !== -1) {
			fullVersion=fullVersion.substring(0,ix);
		}
		// Obtenga la versión principal
		majorVersion = parseInt(''+fullVersion,10);
		if (isNaN(majorVersion)) {
			fullVersion = ''+parseFloat(navigator.appVersion); 
			majorVersion = parseInt(navigator.appVersion,10);
		}
		// Volver datos
		return [browserName, majorVersion];
	}

	// Variable Global
	var obj = {};

	obj.arBrowserInfo = browserSniff();
	obj.browserName = obj.arBrowserInfo[0];
	obj.browserMajorVersion = obj.arBrowserInfo[1];

	// If IE8, personalizar parar (use retorno)
	// If IE9, personalizar parar (utilizar controles nativos)
	if (obj.browserName === "IE" && (obj.browserMajorVersion === 8 || obj.browserMajorVersion === 9) ) {
		return false;
	}

	// Si smartphone o tablet, detienen la personalización como el video (y subtitulos en disposotivos más recientes se maneja de forma nativa)
	obj.isSmartphoneOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
	if (obj.isSmartphoneOrTablet) {
		return false;
	}

	// Establezca el modo de depuración
	if (typeof(options.debug)==='undefined') {
		options.debug = false;
	}
	obj.debug = options.debug;

	// Información del navegador de salida para iniciar sesión
	if (options.debug) {
		console.log(obj.browserName + " " + obj.browserMajorVersion);
	}

	// Establecer etiqueta aria en el botón con la opción VideoTitle
	if ((typeof(options.videoTitle)==='undefined') || (options.videoTitle==="")) {
		/*obj.playAriaLabel = "Play";*/
		obj.playAriaLabel = "Reproducir";
	}
	else {
		  obj.playAriaLabel = "Reproducir video, " + options.videoTitle;
		/*obj.playAriaLabel = "Play video, " + options.videoTitle;*/
	}

	// Obtener los elementos de video y los controles del contenedor
	obj.container = document.getElementById(options.videoId);
	obj.movie = obj.container.getElementsByTagName('video')[0];
	obj.controls = obj.container.getElementsByClassName('px-video-controls')[0];

	// Retire los controles de video nativos
	obj.movie.removeAttribute("controls");
	
	//Generar números aleatorios para ID/FOR en los atributos de los controles
	obj.randomNum = Math.floor(Math.random() * (10000));
	
	// Inserte los controles de video personalizados
	if (options.debug) {
		console.log("Inserción de los controles de vídeo personalizados");
	}
	obj.controls.innerHTML = '<div class="clearfix">' + 
			'<div class="pull-left">' + 
				'<button class="px-video-restart"><span class="sr-only">Volver a cargar</span></button>' + 
				'<button class="px-video-rewind"><span class="sr-only">Regresar <span class="px-seconds">10</span> segundos</span></button>' + 
				'<button class="px-video-play" aria-label="'+obj.playAriaLabel+'"><span class="sr-only">Reproducir</span></button>' + 
				'<button class="px-video-pause hide"><span class="sr-only">Pausar</span></button>' + 
				'<button class="px-video-forward"><span class="sr-only">Avanzar <span class="px-seconds">10</span> segundos</span></button>' + 
			'</div>' + 
			'<div class="px-video-mute-btn-container pull-left">' + 
				'<input class="px-video-mute sr-only" id="btnMute'+obj.randomNum+'" type="checkbox" />' + 
				'<label id="labelMute'+obj.randomNum+'" for="btnMute'+obj.randomNum+'"><span class="sr-only">Mute</span></label>' + 
			'</div>' + 
			'<div class="pull-left">' + 
				'<label for="volume'+obj.randomNum+'" class="sr-only">Volumen:</label><input id="volume'+obj.randomNum+'" class="px-video-volume" type="range" min="0" max="10" value="5" />' + 
			'</div>' + 
			'<div class="px-video-captions-btn-container pull-left hide">' + 
				'<input class="px-video-btnCaptions sr-only" id="btnCaptions'+obj.randomNum+'" type="checkbox" />' + 
				'<label for="btnCaptions'+obj.randomNum+'"><span class="sr-only">Captions</span></label>' + 
			'</div>' + 
			'<div class="px-video-time">' + 
				'<span class="sr-only">time</span> <span class="px-video-duration">00:00</span>' + 
			'</div>' + 
		'</div>' + 
		'<div>' + 
			'<progress class="px-video-progress" max="100" value="0"><span>0</span>% played</progress>' + 
		'</div>';

	// Ajustar el esquema de ancho del contenedor del video
	obj.movieWidth = obj.movie.width;
	if (obj.movieWidth < 360) {
		obj.movieWidth = 360;
	}
	obj.container.setAttribute("style", "width:" + obj.movieWidth + "px");
	
	// Ajustar el esquema de ancho del contenedor de video Controles/Mute 
	obj.labelMute = document.getElementById("labelMute" + obj.randomNum);
	obj.labelMuteOffset = obj.movieWidth - 390;
	if (obj.labelMuteOffset < 0) {
		obj.labelMuteOffset = 0;
	}
	obj.labelMute.setAttribute("style", "margin-left:" + obj.labelMuteOffset + "px");

	// Obten la URL del archivo del titulo si existe
	var captionSrc = "",
		kind,
		children = obj.movie.childNodes;

	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeName.toLowerCase() === 'track') {
			kind = children[i].getAttribute('kind');
			if (kind === 'captions') {
				captionSrc = children[i].getAttribute('src');
			}
		}
	}

	// Registra si existe archivo de titulo o no
	obj.captionExists = true;
	if (captionSrc === "") {
		obj.captionExists = false;
		if (options.debug) {
			console.log("Sin pista de subtitulos encontrado.");
		}
	}
	else {
		if (options.debug) {
			console.log("Pista de subtitulos encontrada; URI: " + captionSrc);
		}
	}

	// Subtitulos Encendido/Apagado en forma predeterminada
	if (typeof(options.captionsOnDefault) === 'undefined') {
		options.captionsOnDefault = true;
	}
	obj.isCaptionDefault = options.captionsOnDefault;

	// Número de segundos para rebobinado y avances de botones
	if (typeof(options.seekInterval) === 'undefined') {
		options.seekInterval = 10;
	}
	obj.seekInterval = options.seekInterval;
	
	// Obtener los elementos de los controles
	obj.btnPlay = obj.container.getElementsByClassName('px-video-play')[0];
	obj.btnPause = obj.container.getElementsByClassName('px-video-pause')[0];
	obj.btnRestart = obj.container.getElementsByClassName('px-video-restart')[0];
	obj.btnRewind = obj.container.getElementsByClassName('px-video-rewind')[0];
	obj.btnForward = obj.container.getElementsByClassName('px-video-forward')[0];
	obj.btnVolume = obj.container.getElementsByClassName('px-video-volume')[0];
	obj.btnMute = obj.container.getElementsByClassName('px-video-mute')[0];
	obj.progressBar = obj.container.getElementsByClassName('px-video-progress')[0];
	obj.progressBarSpan = obj.progressBar.getElementsByTagName('span')[0];
	obj.captionsContainer = obj.container.getElementsByClassName('px-video-captions')[0];
	obj.captionsBtn = obj.container.getElementsByClassName('px-video-btnCaptions')[0];
	obj.captionsBtnContainer = obj.container.getElementsByClassName('px-video-captions-btn-container')[0];
	obj.duration = obj.container.getElementsByClassName('px-video-duration')[0];
	obj.txtSeconds = obj.container.getElementsByClassName('px-seconds');

	// Actualización de botones en número de segundos en rebobinado y avance rápido
	obj.txtSeconds[0].innerHTML = obj.seekInterval;
	obj.txtSeconds[1].innerHTML = obj.seekInterval;

	// Determine if HTML5 textTracks es compatible (por los titulos)
	obj.isTextTracks = false;
	if (obj.movie.textTracks) {
		obj.isTextTracks = true;
	}

	// Reproducir
	obj.btnPlay.addEventListener('click', function() {
		obj.movie.play();
		obj.btnPlay.className = "px-video-play hide";
		obj.btnPause.className = "px-video-pause px-video-show-inline";
		obj.btnPause.focus();
	}, false);

	// Pausar
	obj.btnPause.addEventListener('click', function() {
		obj.movie.pause(); 
		obj.btnPlay.className = "px-video-play px-video-show-inline";
		obj.btnPause.className = "px-video-pause hide";
		obj.btnPlay.focus();
	}, false);

	// Resetear
	obj.btnRestart.addEventListener('click', function() {
		// Ir al principio
		obj.movie.currentTime = 0;

		// Manejo especial para los titulos "manuales"
		if (!obj.isTextTracks) {
			obj.subcount = 0;
		}

		// Escuchar y asegurar el botón de reproducción que se encuntre en el estado correcto
		obj.movie.play();
		obj.btnPlay.className = "px-video-play hide";
		obj.btnPause.className = "px-video-pause px-video-show-inline";

	}, false);

	// Rebobinar
	obj.btnRewind.addEventListener('click', function() {
	    var targetTime = obj.movie.currentTime - obj.seekInterval;
	    if (targetTime < 0) {
	      obj.movie.currentTime = 0;
	    }
	    else {
	      obj.movie.currentTime = targetTime;
	    }
		// Manejo especial para los titulos manuales
		if (!obj.isTextTracks) {
			adjustManualCaptions(obj);
		}
	}, false);

	// Un avance rápido
	obj.btnForward.addEventListener('click', function() {
	    var targetTime = obj.movie.currentTime + obj.seekInterval;
		if (targetTime > obj.movie.duration) {
			obj.movie.currentTime = obj.movie.duration;
		}
		else {
			obj.movie.currentTime = targetTime;
		}
		// Manejo especial para los titulos manuales
		if (!obj.isTextTracks) {
			adjustManualCaptions(obj);
		}
	}, false);

	// Obtener el elemento de entrada de HTML5 y anexar el ajuste del volumen de audio en el cambio
	obj.btnVolume.addEventListener('change', function() {
		obj.movie.volume = parseFloat(this.value / 10);
	}, false);

	// Mute
	obj.btnMute.addEventListener('click', function() {
		if (obj.movie.muted === true) {
			obj.movie.muted = false;
		}
		else {
			obj.movie.muted = true;
		}
	}, false);
	obj.btnMute.onkeypress = function(e) {
		if(e.keyCode == 13){ // Tecla enter
			e.preventDefault();
			if (this.checked == true) {
				this.checked = false;
			}
			else {
				this.checked = true;
			}
			if (obj.movie.muted === true) {
				obj.movie.muted = false;
			}
			else {
				obj.movie.muted = true;
			}
		}
	}
	
	// Duración
	obj.movie.addEventListener("timeupdate", function() {
		obj.secs = parseInt(obj.movie.currentTime % 60);
		obj.mins = parseInt((obj.movie.currentTime / 60) % 60);
		
		// Asegurese que sea de 2 dígitos. Por ejemplo 03 en lugar de 3
		obj.secs = ("0" + obj.secs).slice(-2);
		obj.mins = ("0" + obj.mins).slice(-2);

		// Hacer
		obj.duration.innerHTML = obj.mins + ':' + obj.secs;
	}, false);

	// Barra de progreso
	obj.movie.addEventListener('timeupdate', function() {
		obj.percent = (100 / obj.movie.duration) * obj.movie.currentTime;
		if (obj.percent > 0) {
			obj.progressBar.value = obj.percent;
			obj.progressBarSpan.innerHTML = obj.percent;
		}
	}, false);

	// Saltar al hacer click en la barra de progreso
	obj.progressBar.addEventListener('click', function(e) {
		obj.pos = (e.pageX - this.offsetLeft) / this.offsetWidth;
		obj.movie.currentTime = obj.pos * obj.movie.duration;
		
		// Manejo especial para los titulos manuales
		if (!obj.isTextTracks) {
			adjustManualCaptions(obj);
		}
	});

	// Leyendas claras al final del video
	obj.movie.addEventListener('ended', function() {
		obj.captionsContainer.innerHTML = "";
	});

	// ***
	// Subtítulos
	// ***

	// Cambia la visualización de subtitulos con el boton subtitulo
	obj.captionsBtn.addEventListener('click', function() { 
		if (this.checked) {
			obj.captionsContainer.className = "px-video-captions show";
		} else {
			obj.captionsContainer.className = "px-video-captions hide";
		}
	}, false);
	obj.captionsBtn.onkeypress = function(e) {
		if(e.keyCode == 13){ // Tecla enter
			e.preventDefault();
			if (this.checked == true) {
				this.checked = false;
			}
			else {
				this.checked = true;
			}
			if (this.checked) {
				obj.captionsContainer.className = "px-video-captions show";
			} else {
				obj.captionsContainer.className = "px-video-captions hide";
			}
		}
	}

	// Si no existe ningún archivo de título ocultar contenedor de texto de leyenda
	if (!obj.captionExists) {
		obj.captionsContainer.className = "px-video-captions hide";
	}

	// Si existe archivo de título, o subtitulos en proceso
	else {

		// Si IE 10/11 o Firefox 31+ o Safari 7+, no utilice subtitulos nativos (todavía no funcioan a pesar de que dicen que es ahora compatible)
		if ((obj.browserName==="IE" && obj.browserMajorVersion===10) || 
				(obj.browserName==="IE" && obj.browserMajorVersion===11) || 
				(obj.browserName==="Firefox" && obj.browserMajorVersion>=31) || 
				(obj.browserName==="Safari" && obj.browserMajorVersion>=7)) {
			if (options.debug) {
				console.log("Detectado IE 10/11 o Firefox 31+ o Safari 7+");
			}
			// establecer en false por saltar al subtitulado manual
			obj.isTextTracks = false;
			
			// desactivar presentación de la leyenda nativa para evitar doblaje en subtitulos (no funciona en Safari 7)
			var track = {};
			var tracks = obj.movie.textTracks;
			for (var j=0; j < tracks.length; j++) {
				track = obj.movie.textTracks[j];
				track.mode = "hidden";
			}
		}

		// Rendering pistas de subtítulos - soporte nativo requiere - http://caniuse.com/webvtt
		if (obj.isTextTracks) {
			if (options.debug) {
				console.log("textTracks supported");
			}
			showCaptionContainerAndButton(obj);

			var track = {};
			var tracks = obj.movie.textTracks;
			for (var j=0; j < tracks.length; j++) {
				track = obj.movie.textTracks[j];
				track.mode = "hidden";
				if (track.kind === "captions") {
					track.addEventListener("cuechange",function() {
						if (this.activeCues[0]) {
							if (this.activeCues[0].hasOwnProperty("text")) {
								obj.captionsContainer.innerHTML = this.activeCues[0].text;
							}
						}
					},false);
				}
			}
		}
		// Leyenda de pistas no compatible de forma nativa
		else {
			if (options.debug) {
				console.log("textTracks no soportados por renderización subtitulos 'manuales'");
			}
			showCaptionContainerAndButton(obj);

			// Matriz de subtitulos en el momento adecuado
			obj.currentCaption = '';
			obj.subcount = 0;
			obj.captions = [];

			obj.movie.addEventListener('timeupdate', function() {
				// Compruebe su la siguiente leyenda se encuentra en el rango actual
				if (obj.movie.currentTime.toFixed(1) > video_timecode_min(obj.captions[obj.subcount][0]) && 
					obj.movie.currentTime.toFixed(1) < video_timecode_max(obj.captions[obj.subcount][0])) {
						obj.currentCaption = obj.captions[obj.subcount][1];
				}
				// Hay un tiempo de código a un lado?
				if (obj.movie.currentTime.toFixed(1) > video_timecode_max(obj.captions[obj.subcount][0]) && 
					obj.subcount < (obj.captions.length-1)) {
						obj.subcount++;
				}
				// Render el título
				obj.captionsContainer.innerHTML = obj.currentCaption;
			}, false);

			if (captionSrc != "") {
				// Crear object XMLHttpRequest 
				var xhr;
				if (window.XMLHttpRequest) {
					xhr = new XMLHttpRequest();
				} else if (window.ActiveXObject) { // IE8
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				}
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							if (options.debug) {
								console.log("xhr = 200");
							}
							
							obj.captions = [];
							var records = [], 
								record,
								req = xhr.responseText;
							records = req.split('\n\n');
							for (var r=0; r < records.length; r++) {
								record = records[r];
								obj.captions[r] = [];
								obj.captions[r] = record.split('\n');
							}
							// Retire primer elemento ("VTT")
							obj.captions.shift();

							if (options.debug) {
								console.log('Con éxito cargado el archivo de subtítulos a tráves de ajax.');
							}
						} else {
							if (options.debug) {
								console.log('Hubo un problema al cargar el achivo de subtítulos a través de ajax.');
							}
						}
					}
				}
				xhr.open("get", captionSrc, true);
				xhr.send();
			}
		}

		// Si Safari 7, removio el tracking del DOM [ver apagar prestación de leyenda nativa arriba]
		if (obj.browserName === "Safari" && obj.browserMajorVersion === 7) {
			console.log("Safari 7 detectado; eliminación titulo de DOM");
			var tracks = obj.movie.getElementsByTagName("track");
			obj.movie.removeChild(tracks[0]);
		}

	}
};
