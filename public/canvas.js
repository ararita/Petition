var canvas = document.getElementById("canv");
var context = canvas.getContext("2d");
context.strokeStyle = "blue";
var x;
var y;
var draw = false;
var canvasInput = document.getElementById("sig-field");
var drawData;

canvas.addEventListener("mousedown", function(e) {
    x = e.offsetX;
    y = e.offsetY;
    draw = true;
});

canvas.addEventListener("mousemove", function(e) {
    if (draw) {
        context.moveTo(x, y);
        x = e.offsetX;
        y = e.offsetY;
        context.lineTo(x, y);
        context.stroke();
    }
});

canvas.addEventListener("mouseup", function(e) {
    draw = false;
    drawData = canvas.toDataURL();
    canvasInput.value = drawData;
});

// // const canv = document.getElementById("canv");
//
// const canvas = $("#canv");
// const context = canvas.getContext("2d");
//
// // const hidden = $('input[name="signature"]');
// const hidden = document.getElementById("sig-field");
//
// context.strokeStyle = "black";
// context.lineWidth = 4;
//
// (function signature() {
//     let draw;
//     let x, y;
//     canvas.on("mousedown", function(e) {
//         x = e.offsetX;
//         y = e.offsetY;
//         draw = true;
//     });
//     canvas.on("mousemove", function(e) {
//         if (draw) {
//             context.moveTo(x, y);
//             context.lineTo(e.offsetX, e.offsetY);
//             x = e.offsetX;
//             y = e.offsetY;
//             context.stroke();
//         }
//     });
//     canvas.on("mouseup", function(e) {
//         draw = false;
//         let secret = canvas.toDataURL();
//         hidden.val = secret;
//     });
// })();
//
// const submit = $("button");
// submit.on("click", function(e) {
//     // let secret = canvas.toDataURL();
//     // hidden.val(secret);
// });
