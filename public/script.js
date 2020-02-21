//CANVAS
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

let signature;

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
    });
    document.addEventListener("mouseup", () => {

        ctx = null;
        signature = $("input[name='signature']").val(canvas.toDataURL());
        console.log('signature:',signature);
    });
});
