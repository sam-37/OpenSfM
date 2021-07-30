const canvas = document.getElementById("imgCanvas");
const imageListBox = document.getElementById("imageSelectBox");
const context = canvas.getContext("2d");
const Markers = new Array();
const image = new Image();
let imageScale;

function changeImage(image_key) {
    image.onload = function () { drawImage() };
    image.src = 'image/' + image_key;
}

function drawImage() {
    // Clear Canvas
    context.fillStyle = "#FFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Scale image to fit and draw
    const w = image.width;
    const h = image.height;
    if (w > h) {
        imageScale = canvas.width / w;
    }
    else {
        imageScale = canvas.height / h;
    }
    context.drawImage(image, 0, 0, w * imageScale, h * imageScale);

    // Draw markers on top
    drawMarkers();
}

function onImageSelect() {
    const opt = imageListBox.options[imageListBox.options.selectedIndex];
    console.log("selected", opt.value);

    changeImage(opt.value);
}

function populateImageList(points) {
    const L = imageListBox.options.length - 1;
    for (let i = L; i >= 0; i--) {
        imageListBox.remove(i);
    }

    for (let image_id in points) {
        const opt = document.createElement("option");
        opt.text = image_id;
        opt.value = image_id;
        imageListBox.options.add(opt);
    }

    onWindowResize();

}

function initialize_event_source() {
    let sse = new EventSource("/stream");

    sse.addEventListener("sync", function (e) {
        const data = JSON.parse(e.data);
        const delay = Date.now() - Math.round(data.time * 1000);
        console.log("SSE message delay is", delay, "ms");
        populateImageList(data["points"]);
    })

}

function initialize() {
    initialize_event_source();
    canvas.addEventListener("mousedown", mouseClicked, false);
    window.addEventListener("resize", onWindowResize);
    imageListBox.addEventListener('change', onImageSelect);
    resizeCanvas();

}

function resizeCanvas() {
    context.canvas.width = window.innerWidth - imageListBox.offsetWidth - 30;
    context.canvas.height = window.innerHeight - 30;
}

function onWindowResize() {
    // box.size = box.options.length;
    resizeCanvas();
    drawImage();
}

class markerSprite {
    constructor() {
        this.img = new Image();
        this.img.src = "http://www.clker.com/cliparts/w/O/e/P/x/i/map-marker-hi.png"
        this.width = 2*12;
        this.height = 2*20;
        this.XOffset = this.width / 2;
        this.YOffset = this.height;
    }
}
const sprite = new markerSprite();

class Marker {
    constructor(x, y) {
        this.Sprite = sprite;
        this.pixelX = x;
        this.pixelY = y;
    }
}

function drawOneMarker(marker) {
    // Draw marker
    const sprite = marker.Sprite;
    const x = marker.pixelX * imageScale;
    const y = marker.pixelY * imageScale;
    context.drawImage(sprite.img, x - sprite.XOffset, y - sprite.YOffset, sprite.width, sprite.height);

    // Calculate position text
    const markerText = marker.pixelX + ", " + marker.pixelY;

    // Draw a simple box so you can see the position
    const textMeasurements = context.measureText(markerText);
    context.fillStyle = "#666";
    context.globalAlpha = 0.7;
    context.fillRect(x - (textMeasurements.width / 2), y - 15, textMeasurements.width, 20);
    context.globalAlpha = 1;

    // Draw position above
    context.fillStyle = "#000";
    context.fillText(markerText, x, y);
}

function drawMarkers() {
    // Draw markers
    for (let i = 0; i < Markers.length; i++) {
        drawOneMarker(Markers[i]);
    }
};

const mouseClicked = function (mouse) {
    const rect = canvas.getBoundingClientRect();

    // native pixel coordinates
    const pixelX = (mouse.x - rect.left) / imageScale;
    const pixelY = (mouse.y - rect.top) / imageScale;

    const marker = new Marker(pixelX, pixelY);

    Markers.push(marker);
    drawOneMarker(marker);
}

window.addEventListener('load', initialize);