$(document.body).ready(function () {

    // 1. Initialize Red and White Snowflakes
    var sfRed = new Snowflakes({
        color: "#ff0000",
        minSize: 15,
        maxSize: 30,
        count: 25
    });

    var sfWhite = new Snowflakes({
        color: "#e9e5e5",
        minSize: 15,
        maxSize: 30,
        count: 25
    });

    // 2. Parse URL parameters for custom name
    var urlParams = new URLSearchParams(window.location.search);
    var customName = urlParams.get("name");
    
    if (customName) {
        $("#name").text(customName);
        $("#nae").text(customName);
    }

    // 3. Curtain Opening Click Event
    $("#curtain-loader").one("click", function () {
        var $loader = $(this);

        // Trigger curtain opening state
        $loader.addClass("open");

        // Stagger main content display slightly for a seamless cross-fade effect
        setTimeout(function() {
            $(".main").addClass("visible");
        }, 150);

        // Destroy snowflakes smoothly during curtain reveal
        setTimeout(function() {
            if (sfRed) sfRed.destroy();
            if (sfWhite) sfWhite.destroy();
        }, 400);

        // Play audio
        var audio = $('.song')[0];
        if (audio) {
            audio.play().catch(function(err) {
                console.log("Audio playback error:", err);
            });
        }

        // Animate balloon border upward with smooth easing
        $('.balloon-border').animate({ top: -500 }, 9000, 'swing');

        // Smoothly fade out and unmount curtain loader
        setTimeout(function () {
            $loader.fadeOut(1000, function() {
                $loader.remove();
            });
        }, 1600);
    });

    // 4. Initialize Typed.js
    if ($("#typed-strings").length) {
        new Typed("#typed", {
            stringsElement: '#typed-strings',
            typeSpeed: 30,
            backSpeed: 10,
            loop: true
        });
    }
});

/* ================================
   CONFETTI CANVAS ANIMATION (SMOOTHENED)
   ================================ */

var retina = window.devicePixelRatio || 1,
    PI = Math.PI,
    sqrt = Math.sqrt,
    round = Math.round,
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,
    rAF = window.requestAnimationFrame,
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
    _now = Date.now || function () { return new Date().getTime(); };

(function (w) {
    var prev = _now();

    function fallback(fn) {
        var curr = _now();
        var ms = Math.max(0, 16 - (curr - prev));
        var req = setTimeout(fn, ms);
        prev = curr;
        return req;
    }

    var cancel = w.cancelAnimationFrame ||
        w.webkitCancelAnimationFrame ||
        w.clearTimeout;

    rAF = w.requestAnimationFrame ||
        w.webkitRequestAnimationFrame ||
        fallback;

    cAF = function (id) {
        cancel.call(w, id);
    };
}(window));

document.addEventListener("DOMContentLoaded", function () {
    var confettiRibbonCount = 10,
        ribbonPaperCount = 15,
        ribbonPaperDist = 8.0,
        ribbonPaperThick = 8.0,
        confettiPaperCount = 10,
        DEG_TO_RAD = PI / 180,
        colors = [
            ["#df0049", "#660671"],
            ["#00e857", "#005291"],
            ["#2bebbc", "#05798a"],
            ["#ffd200", "#b06c00"]
        ];

    function Vector2(_x, _y) {
        this.x = _x; 
        this.y = _y;
        this.Length = function () {
            return sqrt(this.SqrLength());
        };
        this.SqrLength = function () {
            return this.x * this.x + this.y * this.y;
        };
        this.Add = function (_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
        };
        this.Sub = function (_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
        };
        this.Div = function (_f) {
            this.x /= _f;
            this.y /= _f;
        };
        this.Mul = function (_f) {
            this.x *= _f;
            this.y *= _f;
        };
        this.Normalize = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                this.x *= factor;
                this.y *= factor;
            }
        };
        this.Normalized = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
        };
    }

    Vector2.Sub = function (_vec0, _vec1) {
        return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y);
    };

    function EulerMass(_x, _y, _mass, _drag) {
        this.position = new Vector2(_x, _y);
        this.mass = _mass;
        this.drag = _drag;
        this.force = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.AddForce = function (_f) {
            this.force.Add(_f);
        };
        this.Integrate = function (_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
        };
        this.CurrentForce = function (_pos) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
        };
    }

    function ConfettiPaper(_x, _y) {
        this.pos = new Vector2(_x, _y);
        this.rotationSpeed = (random() * 600 + 800);
        this.angle = DEG_TO_RAD * random() * 360;
        this.rotation = DEG_TO_RAD * random() * 360;
        this.cosA = 1.0;
        this.size = 5.0;
        this.oscillationSpeed = (random() * 1.5 + 0.5);
        this.xSpeed = 40.0;
        this.ySpeed = (random() * 60 + 50.0);
        this.corners = new Array();
        this.time = random();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        for (var i = 0; i < 4; i++) {
            var dx = cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
        }
        this.Update = function (_dt) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = cos(DEG_TO_RAD * this.rotation);
            this.pos.x += cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt;
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y) {
                this.pos.x = random() * ConfettiPaper.bounds.x;
                this.pos.y = 0;
            }
        };
        this.Draw = function (_g) {
            _g.fillStyle = this.cosA > 0 ? this.frontColor : this.backColor;
            _g.beginPath();
            _g.moveTo((this.pos.x + this.corners[0].x * this.size) * retina, (this.pos.y + this.corners[0].y * this.size * this.cosA) * retina);
            for (var i = 1; i < 4; i++) {
                _g.lineTo((this.pos.x + this.corners[i].x * this.size) * retina, (this.pos.y + this.corners[i].y * this.size * this.cosA) * retina);
            }
            _g.closePath();
            _g.fill();
        };
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
        this.particleDist = _dist;
        this.particleCount = _count;
        this.particleMass = _mass;
        this.particleDrag = _drag;
        this.particles = new Array();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.xOff = (cos(DEG_TO_RAD * _angle) * _thickness);
        this.yOff = (sin(DEG_TO_RAD * _angle) * _thickness);
        this.position = new Vector2(_x, _y);
        this.prevPosition = new Vector2(_x, _y);
        this.velocityInherit = (random() * 2 + 4);
        this.time = random() * 100;
        this.oscillationSpeed = (random() * 2 + 2);
        this.oscillationDistance = (random() * 40 + 40);
        this.ySpeed = (random() * 40 + 80);
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
        this.Update = function (_dt) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
                var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                dirP.Normalize();
                dirP.Mul((delta / Math.max(_dt, 0.001)) * this.velocityInherit);
                this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
                this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
                var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                rp2.Sub(this.particles[i - 1].position);
                rp2.Normalize();
                rp2.Mul(this.particleDist);
                rp2.Add(this.particles[i - 1].position);
                this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                this.Reset();
            }
        };
        this.Reset = function () {
            this.position.y = -random() * ConfettiRibbon.bounds.y;
            this.position.x = random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = random() * 2 + 4;
            this.time = random() * 100;
            this.oscillationSpeed = random() * 2.0 + 1.5;
            this.oscillationDistance = (random() * 40 + 40);
            this.ySpeed = random() * 40 + 80;
            var ci = round(random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
        };
        this.Draw = function (_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
                var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                
                var isFront = this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0;
                _g.fillStyle = isFront ? this.frontColor : this.backColor;
                _g.strokeStyle = isFront ? this.frontColor : this.backColor;

                _g.beginPath();
                if (i == 0) {
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                } else if (i == this.particleCount - 2) {
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                } else {
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                }
                _g.closePath();
                _g.stroke();
                _g.fill();
            }
        };
        this.Side = function (x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
        };
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);

    var confettiObj = {};
    confettiObj.Context = function (id) {
        var canvas = document.getElementById(id);
        if (!canvas) return;

        var canvasParent = canvas.parentNode;
        var canvasWidth = canvasParent.offsetWidth;
        var canvasHeight = canvasParent.offsetHeight;
        canvas.width = canvasWidth * retina;
        canvas.height = canvasHeight * retina;
        var context = canvas.getContext('2d');
        var confettiRibbons = new Array();
        
        ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        for (var i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(random() * canvasWidth, -random() * canvasHeight * 2, ribbonPaperCount, ribbonPaperDist, ribbonPaperThick, 45, 1, 0.05);
        }

        var confettiPapers = new Array();
        ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
        for (var j = 0; j < confettiPaperCount; j++) {
            confettiPapers[j] = new ConfettiPaper(random() * canvasWidth, random() * canvasHeight);
        }

        var lastTime = _now();

        this.resize = function () {
            canvasWidth = canvasParent.offsetWidth;
            canvasHeight = canvasParent.offsetHeight;
            canvas.width = canvasWidth * retina;
            canvas.height = canvasHeight * retina;
            ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
            ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        };

        this.start = function () {
            this.stop();
            lastTime = _now();
            this.update();
        };

        this.stop = function () {
            cAF(this.interval);
        };

        this.update = function () {
            var nowTime = _now();
            var dt = (nowTime - lastTime) / 1000.0;
            lastTime = nowTime;

            // Cap dt to avoid sudden huge jumps when switching browser tabs
            if (dt > 0.1) dt = 0.016;

            context.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < confettiPaperCount; i++) {
                confettiPapers[i].Update(dt);
                confettiPapers[i].Draw(context);
            }
            for (var j = 0; j < confettiRibbonCount; j++) {
                confettiRibbons[j].Update(dt);
            }

            var self = this;
            this.interval = rAF(function () {
                self.update();
            });
        };
    };

    var confetti = new confettiObj.Context('confetti');
    confetti.start();

    window.addEventListener('resize', function () {
        confetti.resize();
    });
});