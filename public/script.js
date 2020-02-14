//CANVAS
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var submit = $('button');
const firstName = $('input[name="signature"]').val(canvas);

canvas.addEventListener("mousedown", function(event) {
    console.log("x & y mousedown", xposition, yposition);
    ctx = canvas.getContext("2d");
    var xposition = event.offsetX;
    var yposition = event.offsetY;
    ctx.strokeStyle = "black";
    ctx.moveTo(xposition, yposition);
    canvas.addEventListener("mousemove", event => {
        var xposition = event.offsetX;
        var yposition = event.offsetY;
        ctx.lineTo(xposition, yposition);
        ctx.stroke();
        // ctx.closePath();
    });
    canvas.addEventListener("mouseup", () => {
        // var xposition = event.offsetX;
        // var yposition = event.offsetY;
        const signature = $('input[name="signature"]').val(canvas.toDataUrl());
        
        ctx = null;
    });
});

submit.on.click(
    console.log
)


// document.addEventListener('click', )
