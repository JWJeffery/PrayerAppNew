/**
 * TOOLTIP.JS
 * Info button tooltip system for The Universal Office.
 * Handles `.info-btn` elements with `data-tip` attributes.
 */
(function () {
    const tooltip = document.getElementById('uo-tooltip');
    if (!tooltip) return;

    document.addEventListener('mouseover', function (e) {
        const btn = e.target.closest('.info-btn');
        if (btn && btn.dataset.tip) {
            tooltip.textContent = btn.dataset.tip;
            tooltip.style.display = 'block';
        }
    });

    document.addEventListener('mouseout', function (e) {
        if (e.target.closest('.info-btn')) {
            tooltip.style.display = 'none';
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (tooltip.style.display === 'block') {
            const x = e.clientX + 16;
            const y = e.clientY - 10;
            const overflowRight = x + 296 > window.innerWidth;
            tooltip.style.left = (overflowRight ? e.clientX - 296 : x) + 'px';
            tooltip.style.top  = Math.max(8, y) + 'px';
        }
    });
})();