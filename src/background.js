function run()
{
	var imgs = document.querySelectorAll("img");
	for (var i=0; i<imgs.length; i++)
	{
		var img = imgs[i];

		if (img.complete == false) {
			// img hasn't been fully loaded
			continue;
		}

		if (img.parentNode != null && img.parentNode.getAttribute("ext-canvas2d") == "true") {
			// already patched
			continue;
		}

		var kx = img.width/img.naturalWidth;
		var ky = img.height/img.naturalHeight;

		if (kx == ky && Math.floor(kx) == kx && kx >= 2)
		{
			// check if is a .png, .bmp, or .gif
			var src = img.src.toLowerCase();
			var ext = src.substr(-4);
			if (ext != ".png" && ext != ".gif" && ext != ".bmp")
			{
				// ignore this file
				continue;
			}

			// create canvas as big as scaled output
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			// first draw the 1:1 image, so we can get its pixels
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
				
			var datain = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
			var dataout = ctx.createImageData(img.width, img.height);

			var ptrin = datain.data;
			var ptrout = dataout.data;

			for (var y=0; y<datain.height; y++)
			{
				// each row, scale horizontally
				var offsetin = y*datain.width*4;
				var offsetout = y*dataout.width*ky*4;

				for (var x=0; x<datain.width; x++)
				{
					var r = ptrin[offsetin++];
					var g = ptrin[offsetin++];
					var b = ptrin[offsetin++];
					var a = ptrin[offsetin++];

					for (var x0=0; x0<kx; x0++)
					{
						ptrout[offsetout++] = r;
						ptrout[offsetout++] = g;
						ptrout[offsetout++] = b;
						ptrout[offsetout++] = a;
					}
				}

				var row = dataout.data.subarray(y*ky*dataout.width*4, (y*ky+1)*dataout.width*4);
				for (y0=1; y0<ky; y0++)
				{
					dataout.data.set(row, (y*ky+y0)*dataout.width*4);
				}
			}

			// paste result back onto cavnas
			ctx.putImageData(dataout, 0, 0);

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

			img.style.position = "absolute";
			img.style.top = -img.height;
			img.style.left = "0px";
			img.style.zIndex = 2;
			img.style.opacity = 0;

			// add these two children to img
			div.appendChild(canvas);
			div.appendChild(img);

			// so we don't loop
			div.setAttribute("ext-canvas2d", "true");
		}
	}
}

setInterval(run, 50);
