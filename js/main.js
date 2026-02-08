const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function liftItem(item, dropDistance) {
    if (isTouchDevice) {
        // mobile: directly apply transform to item so lift works
        item.style.transition = "transform 0.9s ease-in-out";
        item.style.transform = `translateY(-${dropDistance}px)`;
    } else {
        // desktop: update CSS variable so hover tilt works
        item.style.transition = "transform 0.9s ease-in-out";
        item.style.setProperty("--translate-y", `-${dropDistance}px`);
    }
}

function resetItem(item) {
    if (isTouchDevice) {
        item.style.transition = "transform 0.6s ease";
        item.style.transform = `translateY(0px)`;
    } else {
        item.style.transition = "transform 0.6s ease";
        item.style.setProperty("--translate-y", "0px");
    }
}

const items = document.querySelectorAll(".item");
const detailView = document.getElementById("detail-view");
const detailContent = document.getElementById("detail-content");
const closeBtn = document.getElementById("close-detail");
const machine = document.querySelector(".machine-frame");
const claw = document.getElementById("claw");


items.forEach(item => {
    item.addEventListener("click", () => {
        // prevent overlapping animations
        if (claw.dataset.moving === "true") return;
        claw.dataset.moving = "true";

        const itemRect = item.getBoundingClientRect();
        const clawRect = claw.getBoundingClientRect();
        const machineRect = machine.getBoundingClientRect();

        const clawCurrentX = clawRect.left - machineRect.left;  // claw left edge
        const itemCenterX = itemRect.left + itemRect.width / 2 - machineRect.left;  // center of item
        const moveX = itemCenterX - (clawCurrentX + clawRect.width / 2);    // align claw center to item center

        const clawBottomY = clawRect.top + clawRect.height;     // claw bottom edge
        const itemTopY = itemRect.top;  // item top edge
        const dropDistance = itemTopY - clawBottomY + 40;

        // move claw right
        claw.style.transition = "transform 0.6s ease-out";
        claw.style.transform = `translate(${moveX}px, 0px)`;

        setTimeout(() => {
            // move claw down from horizontal position
            claw.style.transition = "transform 0.9s ease-in-out";
            claw.style.transform = `translate(${moveX}px, ${dropDistance}px)`;

            setTimeout(() => {
                // move claw up
                claw.style.transition = "transform 0.9s ease-in-out";
                claw.style.transform = `translate(${moveX}px, 0px)`;

                // move item up
                liftItem(item, dropDistance);

                setTimeout(() => {
                    // open detail panel
                    openDetail(item.dataset.target, () => {
                        // reset claw and item after detail panel is closed
                        resetItem(item);
                        
                        claw.style.transition = "transform 0.6s steps(6)";
                        claw.style.transform = "translate(0px, 0px)";

                        claw.dataset.moving = "false";
                    });
                }, 900); // wait for claw up
            }, 900); // wait for claw down
        }, 600); // wait for horizontal move 
    });
});


closeBtn.addEventListener("click", () => {
    detailView.hidden = true;
    if (detailView._onClose) {
        detailView._onClose();
        detailView._onClose = null;
    }
});

// close detail panel when click outside
detailView.addEventListener("click", (e) => {
    if (!detailContent.contains(e.target)) {
        detailView.hidden = true;
        if (detailView._onClose) {
            detailView._onClose();
            detailView._onClose = null;
        }
    }
});


function openDetail(type, onClose) {
    document.getElementById("detail-body").innerHTML = getContent(type);
    detailView.hidden = false;

    // save callback to reset claw & item after panel closes
    detailView._onClose = onClose || null;
}


function getContent(type) {
    const contentDiv = document.querySelector(
        `#detail-content-data [data-type="${type}"]`
    );
    return contentDiv ? contentDiv.innerHTML : "<p>No content available</p>";
}
