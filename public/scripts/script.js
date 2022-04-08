$(".input-counter").each(function() {
    var spinner = jQuery(this),
        input = spinner.find(".product-input"),
        btnUp = spinner.find(".plus-btn"),
        btnDown = spinner.find(".minus-btn"),
        min = input.attr("min"),
        max = input.attr("max");
    btnUp.on("click", function() {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }

        spinner.find(".product-input").val(newVal);
        spinner.find(".product-input").trigger("change");
    });
    btnDown.on("click", function() {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find(".product-input").val(newVal);
        spinner.find(".product-input").trigger("change");
    });
});

function signin() {
    const p = document.getElementById("signInPass");
    if (p.type === "password") {
        p.setAttribute("type", "text");
        p.setAttribute("data-type", "text");
    } else {
        p.setAttribute("type", "password");
        p.setAttribute("data-type", "password");
    }
}

function signup() {
    const p = document.getElementById("pass");
    if (p.type === "password") {
        p.setAttribute("type", "text");
        p.setAttribute("data-type", "text");
    } else {
        p.setAttribute("type", "password");
        p.setAttribute("data-type", "password");
    }
}