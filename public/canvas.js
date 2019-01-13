const canv = document.getElementById("canv");
const context = canv.getContext("2d");

const canvas = $("#canv");
const hidden = $('input[name="signature"]');

context.strokeStyle = "black";
context.lineWidth = 4;

(function signature() {
    let draw;
    let x, y;
    canvas.on("mousedown", function(e) {
        x = e.offsetX;
        y = e.offsetY;
        draw = true;
    });
    canvas.on("mousemove", function(e) {
        if (draw) {
            context.moveTo(x, y);
            context.lineTo(e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;
            context.stroke();
        }
    });
    $(document).on("mouseup", function(e) {
        draw = false;
    });
})();
