/**
 * TOOLTIP.JS
 * Info button tooltip system for The Universal Office.
 * Handles `.info-btn` elements with `data-tip` attributes.
 */
(function () {
    const tooltip = document.getElementById('uo-tooltip');
    if (!tooltip) return;

    let activeButton = null;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    function viewportWidth() {
        return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    }

    function viewportHeight() {
        return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    }

    function prepareTooltip() {
        const maxWidth = Math.min(296, Math.max(180, viewportWidth() - 24));
        tooltip.style.maxWidth = maxWidth + 'px';
        tooltip.style.width = 'max-content';
        tooltip.style.whiteSpace = 'normal';
        tooltip.style.overflowWrap = 'break-word';
        tooltip.style.boxSizing = 'border-box';
        return maxWidth;
    }

    function positionTooltipFromPoint(clientX, clientY) {
        const maxWidth = prepareTooltip();
        const margin = 12;
        const gap = 12;
        const vw = viewportWidth();
        const vh = viewportHeight();

        tooltip.style.left = '0px';
        tooltip.style.top = '0px';

        const width = Math.min(tooltip.offsetWidth || maxWidth, maxWidth);
        const height = tooltip.offsetHeight || 48;

        const preferredRight = clientX + gap;
        const preferredLeft = clientX - width - gap;

        let left = preferredRight + width <= vw - margin ? preferredRight : preferredLeft;
        left = clamp(left, margin, Math.max(margin, vw - width - margin));

        const preferredTop = clientY + gap;
        const fallbackTop = clientY - height - gap;

        let top = preferredTop + height <= vh - margin ? preferredTop : fallbackTop;
        top = clamp(top, margin, Math.max(margin, vh - height - margin));

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function positionTooltipFromButton(button) {
        const rect = button.getBoundingClientRect();
        positionTooltipFromPoint(rect.left + rect.width / 2, rect.bottom);
    }

    function showTooltip(button) {
        if (!button || !button.dataset.tip) return;

        activeButton = button;
        tooltip.textContent = button.dataset.tip;
        tooltip.style.display = 'block';
        tooltip.setAttribute('aria-hidden', 'false');
        positionTooltipFromButton(button);
    }

    function hideTooltip() {
        activeButton = null;
        tooltip.style.display = 'none';
        tooltip.setAttribute('aria-hidden', 'true');
    }

    document.addEventListener('mouseover', function (event) {
        const button = event.target.closest('.info-btn');
        if (button) showTooltip(button);
    });

    document.addEventListener('mouseout', function (event) {
        if (event.target.closest('.info-btn')) hideTooltip();
    });

    document.addEventListener('mousemove', function (event) {
        if (tooltip.style.display === 'block') {
            positionTooltipFromPoint(event.clientX, event.clientY);
        }
    });

    document.addEventListener('focusin', function (event) {
        const button = event.target.closest('.info-btn');
        if (button) showTooltip(button);
    });

    document.addEventListener('focusout', function (event) {
        if (event.target.closest('.info-btn')) hideTooltip();
    });

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.info-btn');

        if (button) {
            event.preventDefault();
            event.stopPropagation();

            if (activeButton === button && tooltip.style.display === 'block') {
                hideTooltip();
            } else {
                showTooltip(button);
            }
            return;
        }

        if (tooltip.style.display === 'block') hideTooltip();
    });

    document.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', function () {
        if (activeButton && tooltip.style.display === 'block') {
            positionTooltipFromButton(activeButton);
        }
    });
})();
