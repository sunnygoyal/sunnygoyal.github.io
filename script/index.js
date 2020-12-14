function loadImage(url) {
  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}
function AnimatedValue(callback) {
  this.callback = callback;
  this.value = 0;
  this.interpolator = x => x;
  this.duration = 250;

  this._animating = false;
  this._startValue = 0;
  this._startTime = 0;
  this._endValue = 0;
  this._animCallback = this._doFrame.bind(this);
  
}
AnimatedValue.prototype.setValue = function(v) {
    if (this._endValue == v) {
        return;
    }
    this._startValue = this.value;
    this._endValue = v;
    this._delta = (v - this._startValue);
    this._startTime = Date.now();
    if (!this._animating) {
        this.callback(this.value);
        this._animating = true;
        requestAnimationFrame(this._animCallback);
    }
};
AnimatedValue.prototype._doFrame = function() {
    let now = Date.now();
    let t = Math.min((now - this._startTime) / this.duration, 1);
    this.value = this._startValue + this._delta * this.interpolator(t);
    this.callback(this.value);
    if (t < 1) {
        requestAnimationFrame(this._animCallback);
    } else {
        this._animating = false;
    }
};

const logoSize = 130;
function imgTexture(img) {
    return new Zdog.Texture({img:img, dst: [-logoSize/2, -logoSize/2, logoSize, logoSize], src:[img.width, 0, -img.width, img.height]});
}
// Set up title icon
loadImage("https://avatars.githubusercontent.com/u/672456?s=250").then(img => {
    var illo = new Zdog.Illustration({ element: "#title_icon" });
    illo.setSize(150, 150);
    function createDisk(img1, img2) {
        return new Zdog.Cylinder({
            addTo: illo,
            diameter: logoSize,
            length: 10,
            color: "#333",
            frontFace: imgTexture(img1),
            backface: imgTexture(img2),
            stroke: .5,
          }
        );
    }
    var disk = createDisk(img, img);
    // load profile
    loadImage("style/profile.png").then(img2 => {
        disk.remove();
        disk = createDisk(img, img2);
        illo.updateRenderGraph();
    })
    
    var hoverRotate, clickRotate;
    var callback = function() {
        illo.rotate.y = hoverRotate.value + clickRotate.value;
        illo.updateRenderGraph();
    }
    hoverRotate = new AnimatedValue(callback);
    clickRotate = new AnimatedValue(callback);

    // overshoot interpolator
    const tension = 2.0;
    hoverRotate.interpolator = clickRotate.interpolator = t => {
        t -= 1.0;
        return t * t * ((tension + 1) * t + tension) + 1.0;
    }
    clickRotate.duration = 550;

    let el = document.getElementById("title_icon");
    el.addEventListener("touchstart", () => hoverRotate.setValue(0.5))
    el.addEventListener("mouseenter", () => hoverRotate.setValue(0.5))

    el.addEventListener("mouseleave", () => hoverRotate.setValue(0))
    el.addEventListener("touchmove", () => hoverRotate.setValue(0))
    el.addEventListener("click", () => hoverRotate.setValue(0))

    el.addEventListener("click", () => clickRotate.setValue(clickRotate._endValue + Math.PI));
    illo.updateRenderGraph();
});

  
  