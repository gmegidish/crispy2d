function run() {
	// select only images that haven't been processed before
	var imgs = document.querySelectorAll("img:not([x-crispy2d=true])");
	for (var i=0; i<imgs.length; i++) {
		var img = imgs[i];

		if (img.complete == false) {
			// img hasn't been fully loaded
			continue;
		}

		// mark this image as processed, regardless if a canvas was
		// wrapped around it.
		img.setAttribute("x-crispy2d", "true");

		// check if is a .png, .bmp, or .gif
		var src = img.src.toLowerCase();
		var ext = src.substr(-4);
		if (ext != ".png" && ext != ".gif" && ext != ".bmp") {
			// ignore this file
			continue;
		}

		var width = img.width;
		var height = img.height;

		// use computed style if possible, this is because some sites,
		// (lemonamiga for example) use 100% as image size, rather than
		// provide pixel values.
		var css = document.defaultView.getComputedStyle(img, null);
		if (css != null) {
			width = parseInt(css['width']);
			height = parseInt(css['height']);
		}

		var kx = width/img.naturalWidth;
		var ky = height/img.naturalHeight;

		// only operate on 2x and onwards
		if (kx == ky && Math.floor(kx) == kx && kx >= 2) {
			// create canvas as big as scaled output
			var canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			// first draw the 1:1 image, so we can get its pixels
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
				
			var datain = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
			var dataout = ctx.createImageData(width, height);

			var ptrin = datain.data;
			var ptrout = dataout.data;

			var stridein = datain.width*4;
			var strideout = dataout.width*4;

			for (var y=0; y<datain.height; y++) {
				// each row, scale horizontally
				var offsetin = y*stridein;
				var offsetout = y*ky*strideout;

				for (var x=0; x<datain.width; x++) {
					var r = ptrin[offsetin++];
					var g = ptrin[offsetin++];
					var b = ptrin[offsetin++];
					var a = ptrin[offsetin++];

					for (var x0=0; x0<kx; x0++) {
						ptrout[offsetout++] = r;
						ptrout[offsetout++] = g;
						ptrout[offsetout++] = b;
						ptrout[offsetout++] = a;
					}
				}

				var row = dataout.data.subarray(y*ky*strideout, (y*ky+1)*strideout);
				for (y0=1; y0<ky; y0++) {
					dataout.data.set(row, (y*ky+y0)*strideout);
				}
			}

			// paste result back onto cavnas
			ctx.putImageData(dataout, 0, 0);

			// wrap it with a div
			var div = document.createElement("div");
			div.style.display = "inline";
			div.style.width = canvas.width + "px";
			div.style.height = canvas.height + "px";
			div.style.marginTop = "0px";
			div.style.marginLeft = "0px";
			div.style.marginRight = "0px";
			div.style.marginBottom = "0px";

			// replace the old image with this canvas
			img.parentNode.insertBefore(div, img);
			img.parentNode.removeChild(img);

			div.style.position = "relative";

			// keep the image there, transparent, so the user
			// can still do right-click and save 
			img.style.position = "absolute";
			img.style.top = -img.height;
			img.style.left = "0px";
			img.style.zIndex = 2;
			img.style.opacity = 0;

			// add these two children to img
			div.appendChild(canvas);
			div.appendChild(img);
		}
	}
}

setInterval(run, 50);
